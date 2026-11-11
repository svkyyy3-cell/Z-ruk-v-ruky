import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ListingsProvider } from './context/ListingsContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { MessagesProvider } from './context/MessagesContext';
import { PreferencesProvider } from './context/PreferencesContext';
import { RootLayout } from './components/layout/RootLayout';
import { RequireAuth } from './components/account/RequireAuth';
import { PageLoader } from './components/ui/Spinner';
import { INFO_PAGES } from './data/pages';
import HomePage from './pages/HomePage';
import RouteError from './pages/RouteError';

/**
 * Lazily loaded route: the page's code is fetched the first time it is
 * visited. `auth: true` redirects guests to the login page.
 */
function page(load, { auth = false, props = {}, pick = 'default' } = {}) {
  return {
    lazy: async () => {
      const module = await load();
      const Page = module[pick];
      const element = <Page {...props} />;
      return { element: auth ? <RequireAuth>{element}</RequireAuth> : element };
    },
  };
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    hydrateFallbackElement: <PageLoader />,
    children: [
      {
        errorElement: <RouteError />,
        children: [
          { index: true, element: <HomePage /> },
          { path: 'categories', ...page(() => import('./pages/CategoriesPage')) },
          { path: 'c/:slug', ...page(() => import('./pages/CategoryPage')) },
          { path: 'search', ...page(() => import('./pages/SearchPage')) },
          { path: 'listing/:id', ...page(() => import('./pages/ListingPage')) },
          { path: 'listing/:id/edit', ...page(() => import('./pages/EditListingPage'), { auth: true }) },
          { path: 'post', ...page(() => import('./pages/PostAdPage'), { auth: true }) },
          { path: 'login', ...page(() => import('./pages/AuthPages'), { pick: 'LoginPage' }) },
          { path: 'register', ...page(() => import('./pages/AuthPages'), { pick: 'RegisterPage' }) },
          { path: 'favorites', ...page(() => import('./pages/FavoritesPage')) },
          { path: 'messages', ...page(() => import('./pages/MessagesPage'), { auth: true }) },
          { path: 'messages/:conversationId', ...page(() => import('./pages/MessagesPage'), { auth: true }) },
          {
            path: 'account',
            ...page(() => import('./pages/account/AccountLayout'), { auth: true }),
            children: [
              { index: true, element: <Navigate to="listings" replace /> },
              { path: 'listings', ...page(() => import('./pages/account/MyListingsPage')) },
              { path: 'favorites', ...page(() => import('./pages/account/AccountFavoritesPage')) },
              { path: 'settings', ...page(() => import('./pages/account/SettingsPage')) },
            ],
          },
          { path: 'user/:id', ...page(() => import('./pages/SellerPage')) },
          ...Object.keys(INFO_PAGES).map((slug) => ({
            path: slug,
            ...page(() => import('./pages/InfoPage'), { props: { slug } }),
          })),
          { path: '*', ...page(() => import('./pages/NotFoundPage')) },
        ],
      },
    ],
  },
]);

export default function App() {
  return (
    <PreferencesProvider>
      <AuthProvider>
        <ListingsProvider>
          <FavoritesProvider>
            <MessagesProvider>
              <RouterProvider router={router} />
            </MessagesProvider>
          </FavoritesProvider>
        </ListingsProvider>
      </AuthProvider>
    </PreferencesProvider>
  );
}
