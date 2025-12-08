import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Check, Copy } from 'lucide-react';

import { cn } from '@/lib/utils';

const codeVariants = cva(
  'inline-flex items-center justify-center rounded-sm border px-2 py-0.5 text-xs font-source-code font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-accent text-accent-foreground [a&]:hover:bg-accent/90',
        destructive:
          'border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        outline: 'text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

function Code({
  className,
  variant,
  asChild = false,
  copy = false,
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof codeVariants> & { asChild?: boolean; copy?: boolean }) {
  const Comp = asChild ? Slot : 'span';
  const [isCopied, setIsCopied] = React.useState(false);
  const { children, ...otherProps } = props;

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const codeElement = e.currentTarget.parentElement;
    if (!codeElement) return;

    const clone = codeElement.cloneNode(true) as HTMLElement;
    const button = clone.querySelector('button');
    if (button) button.remove();

    const textToCopy = clone.textContent || '';

    const copyToClipboard = (text: string) => {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
          return Promise.resolve(document.execCommand('copy'));
        } catch (err) {
          console.error('Fallback copy method failed', err);
          return Promise.reject(err);
        } finally {
          document.body.removeChild(textArea);
        }
      }
    };

    copyToClipboard(textToCopy)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
      });
  };

  return (
    <Comp data-slot="code" className={cn(codeVariants({ variant }), className)} {...otherProps}>
      {copy && !asChild && (
        <button
          onClick={handleCopy}
          className="ml-0.5 inline-flex size-3.5 items-center justify-center rounded-sm hover:bg-muted-foreground/20 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0 transition-colors cursor-pointer"
          type="button"
          aria-label="Copy code"
        >
          {isCopied ? <Check className="size-2.5" /> : <Copy className="size-2.5" />}
        </button>
      )}
      {children}
    </Comp>
  );
}

export { Code, codeVariants };
