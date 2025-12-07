import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

interface LoadingPageProps {
  message?: string;
  className?: string;
}

export default function LoadingPage({ message, className }: LoadingPageProps) {
  return (
    <div className={cn("min-h-screen w-full flex flex-col items-center justify-center bg-background relative overflow-hidden", className)}>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-destructive/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-red-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="h-16 w-16 bg-destructive/10 rounded-2xl flex items-center justify-center animate-pulse">
          <img src="/logo.svg" alt="Fangi logo" className="h-10 w-10" />
        </div>
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
