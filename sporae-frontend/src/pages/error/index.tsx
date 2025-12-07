import { Link, useRouter } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { MoveLeft, Home, RefreshCw } from 'lucide-react';

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
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-destructive/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-red-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />

      <div className="absolute top-8 left-8 flex items-center gap-3">
        <div className="h-10 w-10 bg-destructive/10 rounded-xl flex items-center justify-center">
          <img src="/logo.svg" alt="Fangi logo" className="h-6 w-6" />
        </div>
        <span className="text-xl font-bold tracking-tight text-foreground/80">Fangi</span>
      </div>

      <div className="relative z-10 container mx-auto px-4 flex flex-col items-center text-center">
        <h1 className="text-[12rem] md:text-[16rem] font-black leading-none text-transparent bg-clip-text bg-linear-to-b from-foreground/5 to-foreground/0 select-none pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10">
          {code}
        </h1>

        <div className="space-y-6 max-w-lg">
          <div className="space-y-2">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
              {title}
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">{errorMessage}</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button
              onClick={handleRetry}
              size="lg"
              className="rounded-full px-8 h-12 text-base font-medium shadow-lg hover:shadow-destructive/25 transition-all"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-full px-8 h-12 text-base font-medium"
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
              className="rounded-full px-8 h-12 text-base font-medium hover:bg-muted"
            >
              <Link to="..">
                <MoveLeft className="mr-2 h-4 w-4" />
                Go Back
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 text-sm text-muted-foreground/50">
        Error Code: {code} • {title}
      </div>
    </div>
  );
}
