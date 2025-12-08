import { Link } from '@tanstack/react-router';
import { Home, MoveLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ErrorPage } from '@/components/pages/error-page';

export function MissingClientIdError() {
  return (
    <ErrorPage
      code="400"
      title="Missing Client ID"
      description="The authorization request is missing a client identifier."
      variant="destructive"
    />
  );
}

export function InvalidApplicationError() {
  return (
    <ErrorPage
      code="404"
      title="Invalid Application"
      description="The application requesting authorization could not be found."
      variant="destructive"
    />
  );
}

interface AuthorizationFailedErrorProps {
  error: string;
  onRetry: () => void;
}

export function AuthorizationFailedError({ error, onRetry }: AuthorizationFailedErrorProps) {
  return (
    <ErrorPage code="ERROR" title="Authorization Failed" description={error}>
      <Button
        size="lg"
        className="rounded-full px-8 h-12 text-base font-medium shadow-lg hover:shadow-primary/25 transition-all"
        onClick={onRetry}
      >
        <MoveLeft className="mr-2 h-4 w-4" />
        Try Again
      </Button>
      <Button
        asChild
        variant="ghost"
        size="lg"
        className="rounded-full px-8 h-12 text-base font-medium hover:bg-muted"
      >
        <Link to="/">
          <Home className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
      </Button>
    </ErrorPage>
  );
}
