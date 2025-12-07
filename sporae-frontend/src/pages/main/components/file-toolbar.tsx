import { memo } from 'react';
import { FolderPlus, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FileToolbarProps {
  itemCount: number;
  onCreateFolder: () => void;
  onUploadClick: () => void;
}

export const FileToolbar = memo(function FileToolbar({
  itemCount,
  onCreateFolder,
  onUploadClick,
}: FileToolbarProps) {
  return (
    <div className="flex items-center gap-2 p-2 border-b text-sm bg-background/50 min-h-[40px]">
      <div className="flex-1 pl-2 text-muted-foreground font-medium text-xs uppercase tracking-wider">
        {itemCount} items
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-xs font-medium text-muted-foreground hover:text-foreground"
          onClick={onCreateFolder}
        >
          <FolderPlus className="mr-2 h-3.5 w-3.5" />
          New Folder
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-xs font-medium text-muted-foreground hover:text-foreground"
          onClick={onUploadClick}
        >
          <Upload className="mr-2 h-3.5 w-3.5" />
          Upload
        </Button>
      </div>
    </div>
  );
});
