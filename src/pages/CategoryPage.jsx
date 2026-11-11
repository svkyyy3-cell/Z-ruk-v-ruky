import { useParams } from 'react-router-dom';
import { getCategoryBySlug } from '../data/categories';
import { useDocumentTitle } from '../hooks';
import { ListingsBrowser } from '../components/listings/ListingsBrowser';
import NotFoundPage from './NotFoundPage';

export default function CategoryPage() {
  const { slug } = useParams();
  const category = getCategoryBySlug(slug);
  useDocumentTitle(category?.name ?? 'Category not found');

  if (!category) return <NotFoundPage title="This category doesn’t exist" />;

  return (
    <ListingsBrowser
      key={category.id}
      category={category}
      title={category.name}
      description={category.description}
      breadcrumbs={[
        { label: 'Home', to: '/' },
        { label: 'Categories', to: '/categories' },
        { label: category.name },
      ]}
    />
  );
}
