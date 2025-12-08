import { Spinner } from '@/components/ui/spinner';
import { CardLayout } from '@/components/layout/card-layout';
import { cn } from '@/lib/utils';

interface LoadingPageProps {
  message?: string;
  className?: string;
}

export default function LoadingPage({ message, className }: LoadingPageProps) {
  return (
    <CardLayout className={cn(className, 'text-center')}>
      <div className="flex flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-2">
          <Spinner className="h-8 w-8 text-muted-foreground/50" />
          {message && <p className="text-muted-foreground font-medium animate-pulse">{message}</p>}
        </div>
      </div>
    </CardLayout>
  );
}
