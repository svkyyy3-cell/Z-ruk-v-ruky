import { useDocumentTitle } from '../../hooks';
import { FavoritesView } from '../../components/account/FavoritesView';

export default function AccountFavoritesPage() {
  useDocumentTitle('My favorites');
  return (
    <section aria-labelledby="fav-title">
      <div className="account__section-head">
        <h2 id="fav-title">Favorites</h2>
      </div>
      <FavoritesView columns={3} />
    </section>
  );
}
