import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface FormDialogProps {
  children?: React.ReactNode | ((props: { close: () => void }) => React.ReactNode);
  trigger?: React.ReactNode;
  title: string;
  description?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function FormDialog({
  children,
  trigger,
  title,
  description,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: FormDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);

  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = setControlledOpen ?? setUncontrolledOpen;

  const close = React.useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden">
        <div className="max-h-[85vh] overflow-y-auto scrollbar-thin p-6">
          <div className="flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              {description && <DialogDescription>{description}</DialogDescription>}
            </DialogHeader>
            <div>{typeof children === 'function' ? children({ close }) : children}</div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
