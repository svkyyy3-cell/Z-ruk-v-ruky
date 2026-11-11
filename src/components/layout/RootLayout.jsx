import { Outlet, ScrollRestoration, useMatch, useNavigation } from 'react-router-dom';
import { ToastProvider } from '../../context/ToastContext';
import { Header } from './Header';
import { Footer } from './Footer';
import { MobileTabBar } from './MobileTabBar';

export function RootLayout() {
  const inMessages = useMatch('/messages/*');
  const navigation = useNavigation();
  return (
    <ToastProvider>
      {navigation.state === 'loading' && <div className="route-progress" role="progressbar" aria-label="Loading page" />}
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Header />
      <main id="main" className="main">
        <Outlet />
      </main>
      {!inMessages && <Footer />}
      <MobileTabBar />
      <ScrollRestoration />
    </ToastProvider>
  );
}
