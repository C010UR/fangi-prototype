import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { MoveLeft, Home } from 'lucide-react';
import { ErrorPage } from '@/components/pages/error-page';

export default function NotFoundPage() {
  return (
    <ErrorPage
      code="404"
      title="Page not found"
      description="Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or never existed."
    >
      <Button
        asChild
        size="lg"
        className="rounded-full px-8 h-12 text-base font-medium shadow-lg hover:shadow-primary/25 transition-all"
      >
        <Link to="/">
          <Home className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
      </Button>
      <Button
        asChild
        variant="ghost"
        size="lg"
        className="rounded-full px-8 h-12 text-base font-medium hover:bg-muted"
      >
        <Link to="..">
          <MoveLeft className="mr-2 h-4 w-4" />
          Go Back
        </Link>
      </Button>
    </ErrorPage>
  );
}
