import { useMemo, memo } from 'react';
import { HomeIcon, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    <div className="flex items-center gap-1 p-1 border-b bg-muted/30 text-sm overflow-x-auto whitespace-nowrap shrink-0 scrollbar-thin">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 cursor-pointer"
        onClick={() => onNavigate('/')}
        disabled={currentPath === '/'}
      >
        <HomeIcon className="h-4 w-4" />
      </Button>
      {pathParts.map((part, index) => {
        const path = '/' + pathParts.slice(0, index + 1).join('/');
        return (
          <div key={path} className="flex items-center">
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-sm font-normal cursor-pointer"
              onClick={() => onNavigate(path)}
            >
              {part}
            </Button>
          </div>
        );
      })}
    </div>
  );
});
