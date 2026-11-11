import { useNavigate, useParams } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useListings } from '../context/ListingsContext';
import { useToast } from '../context/ToastContext';
import { useDocumentTitle } from '../hooks';
import { ListingForm, EMPTY_LISTING } from '../components/listing-form/ListingForm';
import { Breadcrumbs, EmptyState } from '../components/ui/Display';
import { Button } from '../components/ui/Button';
import { PageLoader } from '../components/ui/Spinner';

function toFormValues(listing) {
  return {
    ...EMPTY_LISTING,
    title: listing.title,
    category: listing.category,
    price: listing.priceType === 'free' ? '' : String(listing.price ?? ''),
    priceType: listing.priceType ?? 'fixed',
    condition: listing.condition ?? '',
    description: listing.description,
    location: listing.location,
    images: listing.images,
    attributes: Object.fromEntries(Object.entries(listing.attributes ?? {}).map(([k, v]) => [k, String(v)])),
  };
}

export default function EditListingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getListing, updateListing, loading } = useListings();
  const { notify } = useToast();
  const listing = getListing(id);
  useDocumentTitle(listing ? `Edit: ${listing.title}` : 'Edit listing');

  if (loading) return <PageLoader />;

  if (!listing || listing.sellerId !== user.id) {
    return (
      <div className="container page">
        <EmptyState
          as="h1"
          icon={Lock}
          title={listing ? 'You can’t edit this listing' : 'Listing not found'}
          action={
            <Button variant="dark" to="/account/listings">
              Go to my listings
            </Button>
          }
        >
          {listing ? 'Only the seller who posted it can make changes.' : 'It may have been deleted.'}
        </EmptyState>
      </div>
    );
  }

  const save = async (payload) => {
    await updateListing(listing.id, payload);
    notify({ title: 'Changes saved', description: 'Your listing has been updated.' });
    navigate(`/listing/${listing.id}`);
  };

  return (
    <div className="container page">
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: 'My listings', to: '/account/listings' },
          { label: 'Edit listing' },
        ]}
      />
      <header className="page-head">
        <h1 className="page-title">Edit listing</h1>
        <p className="page-lead">Update details, photos or price. Changes go live as soon as you save.</p>
      </header>
      <ListingForm
        key={listing.id}
        initialValues={toFormValues(listing)}
        onSubmit={save}
        submitLabel="Save changes"
        cancelTo={`/listing/${listing.id}`}
      />
    </div>
  );
}
