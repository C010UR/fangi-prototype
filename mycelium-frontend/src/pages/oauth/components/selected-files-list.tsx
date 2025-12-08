import { Trash2 } from 'lucide-react';

import { ContentTypeIcon } from '@/components/ui/content-type-icon';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Empty, EmptyDescription } from '@/components/ui/empty';
import { cn } from '@/lib/utils';
import { type ServerFile } from '@/types';

interface SelectedFilesListProps {
  files: ServerFile[];
  onRemove: (file: ServerFile) => void;
  onClear: () => void;
}

export function SelectedFilesList({ files, onRemove, onClear }: SelectedFilesListProps) {
  return (
    <div className="h-full flex flex-col border rounded-md bg-background overflow-hidden min-w-0">
      <div className="p-3 border-b bg-muted/30 flex items-center justify-between">
        <h3 className="font-medium text-sm">Selected Files ({files.length})</h3>
        {files.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
            onClick={onClear}
          >
            Clear All
          </Button>
        )}
      </div>
      <div className="flex-1 min-h-0 relative">
        <ScrollArea className="h-full w-full">
          <div className="p-2 space-y-2">
            {files.length === 0 && (
              <Empty className="py-8 border-none">
                <EmptyDescription>No files selected</EmptyDescription>
              </Empty>
            )}
            {files.map(file => {
              const key =
                file.is_directory && !file.path.endsWith('/') ? `${file.path}/` : file.path;

              return (
                <div
                  key={key}
                  className="flex items-center gap-2 p-2 rounded-md border bg-card hover:bg-accent/50 transition-colors group overflow-hidden w-full max-w-83"
                >
                  <ContentTypeIcon
                    contentType={file.is_directory ? 'directory' : file.content_type}
                    className={cn(
                      'h-4 w-4 shrink-0',
                      file.is_directory ? 'text-primary fill-none' : 'text-muted-foreground'
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className="text-sm truncate text-left cursor-default w-full"
                          style={{ direction: 'rtl' }}
                        >
                          <bdo dir="ltr">{key}</bdo>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{key}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 transition-opacity shrink-0 cursor-pointer"
                    onClick={() => onRemove(file)}
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
