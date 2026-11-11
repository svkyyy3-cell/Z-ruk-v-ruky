import { Compass } from 'lucide-react';
import { useDocumentTitle } from '../hooks';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/Display';

export default function NotFoundPage({ title = 'We couldn’t find that page' }) {
  useDocumentTitle('Page not found');
  return (
    <div className="container page">
      <div className="notfound">
        <p className="notfound__code" aria-hidden="true">
          404
        </p>
        <EmptyState
          as="h1"
          icon={Compass}
          title={title}
          action={
            <>
              <Button variant="dark" to="/">
                Go to homepage
              </Button>
              <Button variant="secondary" to="/search">
                Browse listings
              </Button>
            </>
          }
        >
          The link may be broken or the page may have moved. Let’s get you back to the good stuff.
        </EmptyState>
      </div>
    </div>
  );
}
