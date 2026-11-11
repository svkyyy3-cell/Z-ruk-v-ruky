import { useAuth } from '../context/AuthContext';
import { useDocumentTitle } from '../hooks';
import { FavoritesView } from '../components/account/FavoritesView';
import { Breadcrumbs } from '../components/ui/Display';

export default function FavoritesPage() {
  useDocumentTitle('Favorites');
  const { user } = useAuth();
  return (
    <div className="container page">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Favorites' }]} />
      <header className="page-head">
        <h1 className="page-title">Favorites</h1>
        <p className="page-lead">
          {user ? 'Everything you’ve saved, in one place.' : 'Saved on this device. Log in to keep them in your account.'}
        </p>
      </header>
      <FavoritesView />
    </div>
  );
}
