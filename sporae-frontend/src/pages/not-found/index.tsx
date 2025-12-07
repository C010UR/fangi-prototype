import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { MoveLeft, Home } from 'lucide-react';
import { MainHeader } from '@/components/main/main-header';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background relative overflow-hidden">
      <MainHeader />

      <div className="relative z-10 container mx-auto px-4 flex flex-col items-center text-center">
        <h1 className="text-[12rem] md:text-[16rem] font-black leading-none text-transparent bg-clip-text bg-linear-to-b from-foreground/5 to-foreground/0 select-none pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10">
          404
        </h1>

        <div className="space-y-6 max-w-lg">
          <div className="space-y-2">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
              Page not found
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Sorry, we couldn't find the page you're looking for. It might have been moved,
              deleted, or never existed.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button
              asChild
              size="lg"
              className="rounded-xl px-8 h-12 text-base font-medium shadow-lg hover:shadow-destructive/25 transition-all"
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
              className="rounded-xl px-8 h-12 text-base font-medium hover:bg-muted"
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
        Error Code: 404 • Not Found
      </div>
    </div>
  );
}
