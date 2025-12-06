import { cn } from '@/lib/utils';

export function BrandLogo({ className }: { className?: string }) {
  return (
    <div className={cn('fixed top-6 left-6 z-0 flex items-center gap-2', className)}>
      <img src="/logo.svg" alt="Fangi logo" className="h-12 w-12" />
      <span className="text-2xl font-semibold tracking-tight text-foreground">Fangi</span>
    </div>
  );
}
