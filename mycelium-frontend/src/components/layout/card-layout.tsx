import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { BrandLogo } from '../ui/brand-logo';

interface CardLayoutProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'destructive';
}

export function CardLayout({ children, className, variant = 'default' }: CardLayoutProps) {
  const isDestructive = variant === 'destructive';

  return (
    <div
      className={cn(
        'min-h-screen w-full flex flex-col items-center bg-background relative overflow-hidden',
        className
      )}
    >
      <div
        className={cn(
          'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full blur-3xl pointer-events-none',
          isDestructive ? 'bg-destructive/5' : 'bg-primary/5'
        )}
      />
      <div
        className={cn(
          'absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none',
          isDestructive ? 'bg-orange-500/10' : 'bg-accent/10'
        )}
      />
      <div
        className={cn(
          'absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none',
          isDestructive ? 'bg-red-500/10' : 'bg-secondary/10'
        )}
      />

      <BrandLogo />

      <div className="relative z-10 container mx-auto px-4 flex flex-col items-center flex-1 justify-center">
        {children}
      </div>
    </div>
  );
}
