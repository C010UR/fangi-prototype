import { memo, useRef } from 'react';
import {
  RefreshCw,
  FolderIcon,
  Download,
  FolderOpen,
  Eye,
  Pencil,
  Trash2,
  FolderPlus,
  Upload,
  Check,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Spinner } from '@/components/ui/spinner';
import { ContentTypeIcon } from '@/components/ui/content-type-icon';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { cn } from '@/lib/utils';
import { type ServerFile } from '@/lib/sporae';

interface FileListProps {
  files: ServerFile[];
  isLoading: boolean;
  error: Error | unknown;
  currentPath: string;
  onNavigate: (path: string) => void;
  onRefresh: () => void;
  onRename: (file: ServerFile) => void;
  onDelete: (file: ServerFile) => void;
  onUpload: () => void;
  onCreateFolder: () => void;
  renamingFile: ServerFile | null;
  renamingName: string;
  setRenamingName: (name: string) => void;
  onRenameSubmit: () => void;
  onRenameCancel: () => void;
  onFileClick: (file: ServerFile) => void;
  onDownload: (e: React.MouseEvent | undefined, file: ServerFile) => void;
}

export const FileList = memo(function FileList({
  files,
  isLoading,
  error,
  currentPath,
  onNavigate,
  onRefresh,
  onRename,
  onDelete,
  onUpload,
  onCreateFolder,
  renamingFile,
  renamingName,
  setRenamingName,
  onRenameSubmit,
  onRenameCancel,
  onFileClick,
  onDownload,
}: FileListProps) {
  const renamingPathRef = useRef<string | null>(null);

  return (
    <>
      <div className="grid grid-cols-[40px_1fr_120px_150px_120px_150px_40px] gap-4 px-4 py-2 border-b bg-muted/20 text-xs text-muted-foreground hidden md:grid shrink-0">
        <div></div>
        <div>Name</div>
        <div>Created By</div>
        <div>Created At</div>
        <div>Updated By</div>
        <div>Updated At</div>
        <div></div>
      </div>

      <div className="flex-1 relative min-h-0">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Spinner className="h-8 w-8 text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-destructive p-4 text-center">
            <p className="font-semibold mb-2">Error loading files</p>
            <p className="text-sm text-muted-foreground mb-4">{(error as Error).message}</p>
            <Button variant="outline" size="sm" className="cursor-pointer" onClick={onRefresh}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        ) : (
          <ContextMenu modal={false}>
            <ContextMenuTrigger className="block h-full w-full">
              {files.length === 0 ? (
                <>
                  {currentPath !== '/' && (
                    <div
                      className="m-2 mr-4 group grid grid-cols-[auto_1fr_auto] md:grid-cols-[40px_1fr_120px_150px_120px_150px_40px] items-center gap-4 p-2 rounded-lg border border-transparent hover:border-border hover:bg-accent/50 transition-all cursor-pointer bg-accent/10"
                      onClick={() => {
                        const parentPath = currentPath.split('/').slice(0, -1).join('/') || '/';
                        onNavigate(parentPath);
                      }}
                    >
                      <div className="h-8 w-8 rounded-md flex items-center justify-center shrink-0">
                        <ContentTypeIcon contentType="directory" className="size-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm truncate font-medium leading-tight">..</p>
                        <p className="md:hidden text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-0.5">
                          Directory
                        </p>
                      </div>
                      <div className="hidden md:block text-xs text-muted-foreground truncate">
                        -
                      </div>
                      <div className="hidden md:block text-xs text-muted-foreground truncate">
                        -
                      </div>
                      <div className="hidden md:block text-xs text-muted-foreground truncate">
                        -
                      </div>
                      <div className="hidden md:block text-xs text-muted-foreground truncate">
                        -
                      </div>
                      <div className="hidden md:block"></div>
                    </div>
                  )}
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground cursor-default">
                    <FolderIcon className="h-12 w-12 mb-4 opacity-20" />
                    <p>This directory is empty</p>
                  </div>
                </>
              ) : (
                <ScrollArea className="h-full">
                  <div className="p-2 pr-4 flex flex-col gap-1 min-h-full">
                    {currentPath !== '/' && (
                      <div
                        className="group grid grid-cols-[auto_1fr_auto] md:grid-cols-[40px_1fr_120px_150px_120px_150px_40px] items-center gap-4 p-2 rounded-lg border border-transparent hover:border-border hover:bg-accent/50 transition-all cursor-pointer bg-accent/10"
                        onClick={() => {
                          const parentPath = currentPath.split('/').slice(0, -1).join('/') || '/';
                          onNavigate(parentPath);
                        }}
                      >
                        <div className="h-8 w-8 rounded-md flex items-center justify-center shrink-0">
                          <ContentTypeIcon
                            contentType="directory"
                            className="size-5 text-primary"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm truncate font-medium leading-tight">..</p>
                          <p className="md:hidden text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-0.5">
                            Directory
                          </p>
                        </div>
                        <div className="hidden md:block text-xs text-muted-foreground truncate">
                          -
                        </div>
                        <div className="hidden md:block text-xs text-muted-foreground truncate">
                          -
                        </div>
                        <div className="hidden md:block text-xs text-muted-foreground truncate">
                          -
                        </div>
                        <div className="hidden md:block text-xs text-muted-foreground truncate">
                          -
                        </div>
                        <div className="hidden md:block"></div>
                      </div>
                    )}
                    {files
                      .sort((a, b) => {
                        if (a.is_directory && !b.is_directory) return -1;
                        if (!a.is_directory && b.is_directory) return 1;
                        return a.name.localeCompare(b.name);
                      })
                      .map(file => (
                        <ContextMenu key={file.path} modal={false}>
                          <ContextMenuTrigger asChild>
                            <div
                              className={cn(
                                'group grid grid-cols-[auto_1fr_auto] md:grid-cols-[40px_1fr_120px_150px_120px_150px_40px] items-center gap-4 p-2 rounded-lg border border-transparent hover:border-border hover:bg-accent/50 transition-all cursor-pointer',
                                file.is_directory && 'bg-accent/10'
                              )}
                              onClick={() => {
                                if (renamingFile?.path === file.path) return;
                                if (file.is_directory) {
                                  onNavigate(file.path);
                                } else {
                                  onFileClick(file);
                                }
                              }}
                            >
                              <div className="h-8 w-8 rounded-md flex items-center justify-center shrink-0">
                                <ContentTypeIcon
                                  contentType={file.is_directory ? 'directory' : file.content_type}
                                  className={cn(
                                    'size-5',
                                    file.is_directory ? 'text-primary' : 'text-tertiary'
                                  )}
                                />
                              </div>

                              <div
                                className="min-w-0 flex items-center gap-1"
                                onClick={e => {
                                  if (renamingFile?.path === file.path) e.stopPropagation();
                                }}
                              >
                                {renamingFile?.path === file.path ? (
                                  <>
                                    <Input
                                      value={renamingName}
                                      onChange={e => setRenamingName(e.target.value)}
                                      onKeyDown={e => {
                                        if (e.key === 'Enter') onRenameSubmit();
                                        if (e.key === 'Escape') onRenameCancel();
                                        e.stopPropagation();
                                      }}
                                      onClick={e => e.stopPropagation()}
                                      autoFocus
                                      className="h-7 py-1 text-sm min-w-[100px]"
                                    />
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-7 w-7 shrink-0 text-green-500 hover:text-green-600 hover:bg-green-100 dark:hover:bg-green-900/20"
                                      onClick={e => {
                                        e.stopPropagation();
                                        onRenameSubmit();
                                      }}
                                    >
                                      <Check className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-7 w-7 shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                      onClick={e => {
                                        e.stopPropagation();
                                        onRenameCancel();
                                      }}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </>
                                ) : (
                                  <div className="min-w-0">
                                    <p className="text-sm truncate font-medium leading-tight">
                                      {file.name}
                                    </p>
                                    <p className="md:hidden text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-0.5">
                                      {file.is_directory
                                        ? 'Directory'
                                        : file.content_type?.split('/').pop() || 'File'}
                                    </p>
                                  </div>
                                )}
                              </div>

                              <div className="hidden md:block text-xs text-muted-foreground truncate">
                                {file.created_by || '-'}
                              </div>
                              <div className="hidden md:block text-xs text-muted-foreground truncate">
                                {new Date(file.created_at).toLocaleString()}
                              </div>
                              <div className="hidden md:block text-xs text-muted-foreground truncate">
                                {file.updated_by || '-'}
                              </div>
                              <div className="hidden md:block text-xs text-muted-foreground truncate">
                                {new Date(file.updated_at).toLocaleString()}
                              </div>
                              <div className="flex justify-end">
                                {!file.is_directory && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                    onClick={e => onDownload(e, file)}
                                    title="Download"
                                  >
                                    <Download className="h-4 w-4 text-muted-foreground" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </ContextMenuTrigger>
                          <ContextMenuContent
                            onCloseAutoFocus={e => {
                              if (renamingPathRef.current === file.path) {
                                e.preventDefault();
                                renamingPathRef.current = null;
                              }
                            }}
                          >
                            {file.is_directory ? (
                              <ContextMenuItem onClick={() => onNavigate(file.path)}>
                                <FolderOpen className="mr-2 h-4 w-4" /> Open folder
                              </ContextMenuItem>
                            ) : (
                              <>
                                <ContextMenuItem onClick={() => onFileClick(file)}>
                                  <Eye className="mr-2 h-4 w-4" /> View file
                                </ContextMenuItem>
                                <ContextMenuItem onClick={() => onDownload(undefined, file)}>
                                  <Download className="mr-2 h-4 w-4" /> Download file
                                </ContextMenuItem>
                              </>
                            )}
                            <ContextMenuSeparator />
                            <ContextMenuItem
                              onClick={() => {
                                renamingPathRef.current = file.path;
                                onRename(file);
                              }}
                            >
                              <Pencil className="mr-2 h-4 w-4" /> Rename file
                            </ContextMenuItem>
                            <ContextMenuItem
                              onClick={() => onDelete(file)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete file
                            </ContextMenuItem>
                          </ContextMenuContent>
                        </ContextMenu>
                      ))}
                  </div>
                </ScrollArea>
              )}
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem onClick={onCreateFolder}>
                <FolderPlus className="mr-2 h-4 w-4" /> Create new folder
              </ContextMenuItem>
              <ContextMenuItem onClick={onUpload}>
                <Upload className="mr-2 h-4 w-4" /> Upload file
              </ContextMenuItem>
              <ContextMenuItem onClick={onRefresh}>
                <RefreshCw className="mr-2 h-4 w-4" /> Refresh
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        )}
      </div>
    </>
  );
});
