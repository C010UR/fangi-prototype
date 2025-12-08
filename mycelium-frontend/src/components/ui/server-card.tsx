import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { type Server, type ServerShort } from '@/types';
import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';

const serverCardVariants = cva('flex items-center gap-2 shrink-0 max-w-[240px]', {
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

export interface ServerCardProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof serverCardVariants> {
  server: Server | ServerShort;
}

export const ServerCard = forwardRef<HTMLDivElement, ServerCardProps>(
  ({ server, className, variant, ...props }, ref) => {
    return (
      <div ref={ref} className={cn(serverCardVariants({ variant, className }))} {...props}>
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage src={server.image_url || undefined} alt={server.name} />
          <AvatarFallback className="text-xs">{server.name.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col min-w-0">
          <span className="truncate font-medium leading-tight">{server.name}</span>
          <span className="text-xs text-muted-foreground truncate leading-tight">
            {server.urls?.[0] || server.url}
          </span>
        </div>
      </div>
    );
  }
);
ServerCard.displayName = 'ServerCard';
