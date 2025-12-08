import { type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { BrandLogo } from '../ui/brand-logo';

interface ErrorPageProps {
  code?: string;
  title: string;
  description: ReactNode;
  children?: ReactNode;
  className?: string;
  variant?: 'default' | 'destructive';
}

export function ErrorPage({
  code = 'ERROR',
  title,
  description,
  children,
  className,
  variant = 'default',
}: ErrorPageProps) {
  const isDestructive = variant === 'destructive';

  return (
    <div
      className={cn(
        'min-h-screen w-full flex flex-col items-center justify-center bg-background relative overflow-hidden',
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

      <div className="relative z-10 container mx-auto px-4 flex flex-col items-center text-center">
        <h1
          className={cn(
            'text-[10rem] md:text-[14rem] font-black leading-none text-transparent bg-clip-text bg-linear-to-b select-none pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10',
            isDestructive
              ? 'from-destructive/10 to-transparent'
              : 'from-foreground/5 to-foreground/0'
          )}
        >
          {code}
        </h1>

        <div className="space-y-6 max-w-2xl">
          <div className="space-y-2">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
              {title}
            </h2>
            <div className="text-lg text-muted-foreground leading-relaxed">{description}</div>
          </div>

          {children && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              {children}
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-8 text-sm text-muted-foreground/50">
        Error Code: {code} • {title}
      </div>
    </div>
  );
}
