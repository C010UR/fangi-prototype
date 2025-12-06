import * as React from 'react';

import { cn } from '@/lib/utils';
import { BrandLogo } from './brand-logo';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';

interface TwoPaneCardProps extends React.ComponentProps<'div'> {
  imageSrc: string;
  imageAlt?: string;
  imagePosition?: 'left' | 'right';
}

function TwoPaneCard({
  className,
  imageSrc,
  imageAlt = 'Card image',
  imagePosition = 'left',
  children,
  ...props
}: TwoPaneCardProps) {
  const imageSection = (
    <div className="hidden md:block md:w-1/2 relative z-0">
      <img src={imageSrc} alt={imageAlt} className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-linear-to-r from-black/5 to-transparent" />
    </div>
  );

  const contentSection = (
    <div className="w-full md:w-1/2 overflow-auto scrollbar-thin">{children}</div>
  );

  return (
    <>
      <BrandLogo />
      <Card
        className={cn('w-full max-w-6xl h-[600px] flex-row p-0 overflow-hidden', className)}
        {...props}
      >
        {imagePosition === 'left' ? (
          <>
            {imageSection}
            {contentSection}
          </>
        ) : (
          <>
            {contentSection}
            {imageSection}
          </>
        )}
      </Card>
    </>
  );
}

function TwoPaneCardContent({ className, ...props }: React.ComponentProps<typeof CardContent>) {
  return (
    <CardContent
      className={cn('flex flex-col justify-center h-full px-8 py-10 sm:px-10', className)}
      {...props}
    />
  );
}

function TwoPaneCardHeader({ className, ...props }: React.ComponentProps<typeof CardHeader>) {
  return <CardHeader className={cn('p-0 mb-6', className)} {...props} />;
}

function TwoPaneCardTitle({ className, ...props }: React.ComponentProps<typeof CardTitle>) {
  return <CardTitle className={cn('text-2xl font-bold tracking-tight', className)} {...props} />;
}

function TwoPaneCardDescription({
  className,
  ...props
}: React.ComponentProps<typeof CardDescription>) {
  return <CardDescription className={cn('', className)} {...props} />;
}

function TwoPaneCardBody({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="two-pane-card-body" className={cn('space-y-4', className)} {...props} />;
}

function TwoPaneCardFooter({ className, ...props }: React.ComponentProps<typeof CardFooter>) {
  return <CardFooter className={cn('flex-col p-0 mt-6 space-y-3', className)} {...props} />;
}

export {
  TwoPaneCard,
  TwoPaneCardContent,
  TwoPaneCardHeader,
  TwoPaneCardTitle,
  TwoPaneCardDescription,
  TwoPaneCardBody,
  TwoPaneCardFooter,
};
