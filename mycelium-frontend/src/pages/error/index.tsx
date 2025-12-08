import { Link, useRouter } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { MoveLeft, Home, RefreshCw } from 'lucide-react';
import { ErrorPage as ErrorPageView } from '@/components/pages/error-page';

interface ErrorPageProps {
  error?: Error | unknown;
  reset?: () => void;
  title?: string;
  message?: string;
  code?: string | number;
}

export default function ErrorPage({
  error,
  reset,
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again later.',
  code = '500',
}: ErrorPageProps) {
  const router = useRouter();

  const handleRetry = () => {
    if (reset) {
      reset();
    } else {
      router.invalidate();
    }
  };

  const errorMessage = error instanceof Error ? error.message : message;

  return (
    <ErrorPageView
      code={String(code)}
      title={title}
      description={errorMessage}
      variant="destructive"
    >
      <Button
        onClick={handleRetry}
        size="lg"
        className="rounded-xl px-8 h-12 text-base font-medium shadow-lg hover:shadow-destructive/25 transition-all"
      >
        <RefreshCw className="mr-2 h-4 w-4" />
        Try Again
      </Button>

      <Button
        asChild
        variant="outline"
        size="lg"
        className="rounded-xl px-8 h-12 text-base font-medium"
      >
        <Link to="/">
          <Home className="mr-2 h-4 w-4" />
          Go Home
        </Link>
      </Button>

      <Button
        asChild
        variant="ghost"
        size="lg"
        className="rounded-xl px-8 h-12 text-base font-medium hover:bg-muted"
      >
        <Link to="..">
          <MoveLeft className="mr-2 h-4 w-4" />
          Go Back
        </Link>
      </Button>
    </ErrorPageView>
  );
}
