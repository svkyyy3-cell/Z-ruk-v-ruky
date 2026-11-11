import { useNavigate } from 'react-router-dom';
import { useListings } from '../context/ListingsContext';
import { useToast } from '../context/ToastContext';
import { useDocumentTitle } from '../hooks';
import { ListingForm } from '../components/listing-form/ListingForm';
import { Breadcrumbs } from '../components/ui/Display';

export default function PostAdPage() {
  useDocumentTitle('Post an ad');
  const navigate = useNavigate();
  const { createListing } = useListings();
  const { notify } = useToast();

  const publish = async (payload) => {
    const listing = await createListing(payload);
    notify({
      title: 'Your ad is live! 🎉',
      description: 'Buyers can already see it. Manage it any time from your dashboard.',
      action: { to: '/account/listings', label: 'My listings' },
    });
    navigate(`/listing/${listing.id}`, { replace: true });
  };

  return (
    <div className="container page">
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Post an ad' }]} />
      <header className="page-head">
        <h1 className="page-title">Post an ad</h1>
        <p className="page-lead">It takes about two minutes and it’s completely free. Your draft is saved as you type.</p>
      </header>
      <ListingForm onSubmit={publish} submitLabel="Publish ad" useDraft cancelTo="/" />
    </div>
  );
}
