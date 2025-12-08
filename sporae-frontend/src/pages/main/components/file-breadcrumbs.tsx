import { useMemo, memo, Fragment } from 'react';
import { HomeIcon } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { cn } from '@/lib/utils';

interface FileBreadcrumbsProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const FileBreadcrumbs = memo(function FileBreadcrumbs({
  currentPath,
  onNavigate,
}: FileBreadcrumbsProps) {
  const pathParts = useMemo(() => {
    return currentPath.split('/').filter(Boolean);
  }, [currentPath]);

  return (
    <Breadcrumb className="border-b bg-muted/30 p-1 shrink-0">
      <BreadcrumbList className="flex-nowrap overflow-x-auto whitespace-nowrap scrollbar-thin sm:gap-1 px-1">
        <BreadcrumbItem>
          <BreadcrumbLink
            onClick={() => onNavigate('/')}
            className={cn(
              'flex items-center cursor-pointer p-1 rounded-md hover:bg-muted/50 transition-colors',
              currentPath === '/' && 'pointer-events-none opacity-50'
            )}
          >
            <HomeIcon className="h-4 w-4" />
          </BreadcrumbLink>
        </BreadcrumbItem>
        {pathParts.map((part, index) => {
          const path = '/' + pathParts.slice(0, index + 1).join('/');
          const isLast = index === pathParts.length - 1;

          return (
            <Fragment key={path}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className="px-2 font-medium">{part}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    onClick={() => onNavigate(path)}
                    className="cursor-pointer px-2 py-0.5 rounded-md hover:bg-muted/50 transition-colors font-normal text-foreground"
                  >
                    {part}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
});
