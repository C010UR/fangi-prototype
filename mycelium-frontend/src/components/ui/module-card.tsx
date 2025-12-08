import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { type Module, type ModuleShort } from '@/types';
import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';

const moduleCardVariants = cva('flex items-center gap-2 shrink-0 max-w-[240px]', {
  variants: {
    variant: {
      default: '',
      outline: 'border border-border rounded-md p-2',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export interface ModuleCardProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof moduleCardVariants> {
  module: Module | ModuleShort;
}

export const ModuleCard = forwardRef<HTMLDivElement, ModuleCardProps>(
  ({ module, className, variant, ...props }, ref) => {
    return (
      <div ref={ref} className={cn(moduleCardVariants({ variant, className }))} {...props}>
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage src={module.image_url || undefined} alt={module.name} />
          <AvatarFallback className="text-xs">{module.name.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col min-w-0">
          <span className="truncate font-medium leading-tight">{module.name}</span>
          <span className="text-xs text-muted-foreground truncate leading-tight">
            {module.urls?.[0]}
          </span>
        </div>
      </div>
    );
  }
);
ModuleCard.displayName = 'ModuleCard';
