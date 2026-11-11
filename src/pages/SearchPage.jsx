import { useSearchParams } from 'react-router-dom';
import { useDocumentTitle } from '../hooks';
import { ListingsBrowser } from '../components/listings/ListingsBrowser';

export default function SearchPage() {
  const [params] = useSearchParams();
  const q = params.get('q');
  useDocumentTitle(q ? `“${q}”` : 'All listings');

  return (
    <ListingsBrowser
      title="All listings"
      description="Everything for sale, rent and hire across the country."
      breadcrumbs={[{ label: 'Home', to: '/' }, { label: q ? 'Search' : 'All listings' }]}
    />
  );
}
