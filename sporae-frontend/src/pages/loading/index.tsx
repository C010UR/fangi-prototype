import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { MainHeader } from '@/components/main/main-header';

interface LoadingPageProps {
  message?: string;
  className?: string;
}

export default function LoadingPage({ message, className }: LoadingPageProps) {
  return (
    <div className={cn("min-h-screen w-full flex flex-col items-center justify-center bg-background relative overflow-hidden", className)}>
      <MainHeader />

      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-2">
          <Spinner className="h-8 w-8 text-muted-foreground/50" />
          {message && (
            <p className="text-muted-foreground font-medium animate-pulse">{message}</p>
          )}
        </div>
      </div>
    </div>
  );
}
