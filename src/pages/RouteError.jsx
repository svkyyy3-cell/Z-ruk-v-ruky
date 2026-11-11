import { isRouteErrorResponse, useRouteError } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/Display';
import NotFoundPage from './NotFoundPage';

/** Rendered by the router when a page throws while rendering. */
export default function RouteError() {
  const error = useRouteError();
  if (isRouteErrorResponse(error) && error.status === 404) return <NotFoundPage />;

  console.error(error);
  return (
    <div className="container page">
      <EmptyState
        as="h1"
        icon={AlertTriangle}
        title="Something went wrong"
        action={
          <>
            <Button variant="dark" onClick={() => window.location.reload()}>
              Reload page
            </Button>
            <Button variant="secondary" href="/">
              Go to homepage
            </Button>
          </>
        }
      >
        An unexpected error occurred on this page. Reloading usually helps — your data is safe.
      </EmptyState>
    </div>
  );
}
