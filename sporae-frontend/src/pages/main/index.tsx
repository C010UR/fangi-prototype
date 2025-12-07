import { useState, useMemo, useRef } from 'react';
import { sporaeClient, type ServerFile } from '@/lib/sporae';
import { useSporaeProfile, useSporaeFiles, useSporaeLogout } from '@/lib/hooks/use-sporae';
import { Button } from '@/components/ui/button';
import {
  HomeIcon,
  ChevronRight,
  Loader2,
  RefreshCw,
  FolderIcon,
  LogOut,
  Download,
  FolderPlus,
  Upload,
  FolderOpen,
  Eye,
  Pencil,
  Trash2,
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import ErrorPage from '@/pages/error';
import LoadingPage from '@/pages/loading';
import { ContentTypeIcon } from '@/components/ui/content-type-icon';
import { toast } from 'sonner';

export default function MainPage() {
  const [currentPath, setCurrentPath] = useState('/');
  const uploadInputRef = useRef<HTMLInputElement>(null);

  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [renamingFile, setRenamingFile] = useState<ServerFile | null>(null);
  const [renamingName, setRenamingName] = useState('');
  const [fileToDelete, setFileToDelete] = useState<ServerFile | null>(null);

  const {
    data: userProfile,
    isLoading: isProfileLoading,
    error: profileError,
  } = useSporaeProfile();

  const {
    data: files = [],
    isLoading: isFilesLoading,
    error: filesError,
    refetch: refetchFiles,
  } = useSporaeFiles(currentPath);

  const logout = useSporaeLogout();

  const pathParts = useMemo(() => {
    return currentPath.split('/').filter(Boolean);
  }, [currentPath]);

  const navigateTo = (path: string) => {
    setCurrentPath(path);
  };

  const handleCreateFolder = () => {
    setNewFolderName('');
    setIsCreateFolderOpen(true);
  };

  const handleCreateFolderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName) return;

    try {
      await sporaeClient.mkdir(`${currentPath === '/' ? '' : currentPath}/${newFolderName}`);
      toast.success('Folder created');
      refetchFiles();
      setIsCreateFolderOpen(false);
    } catch (error) {
      console.error('Failed to create folder:', error);
      toast.error('Failed to create folder');
    }
  };

  const handleRenameFile = (file: ServerFile) => {
    // Delay to allow context menu to close and focus restoration to complete
    setTimeout(() => {
      setRenamingFile(file);
      setRenamingName(file.name);
    }, 100);
  };

  const handleRenameCancel = () => {
    setRenamingFile(null);
    setRenamingName('');
  };

  const handleRenameSubmit = async () => {
    if (!renamingFile || !renamingName || renamingName === renamingFile.name) {
      handleRenameCancel();
      return;
    }

    try {
      const parentPath = renamingFile.path.split('/').slice(0, -1).join('/') || '/';
      const newPath = `${parentPath === '/' ? '' : parentPath}/${renamingName}`;
      await sporaeClient.mv(renamingFile.path, newPath);
      toast.success('File renamed');
      refetchFiles();
    } catch (error) {
      console.error('Failed to rename file:', error);
      toast.error('Failed to rename file');
    } finally {
      handleRenameCancel();
    }
  };

  const handleDeleteClick = (file: ServerFile) => {
    setFileToDelete(file);
  };

  const handleDeleteConfirm = async () => {
    if (!fileToDelete) return;

    try {
      await sporaeClient.rm(fileToDelete.path);
      toast.success('File deleted');
      refetchFiles();
    } catch (error) {
      console.error('Failed to delete file:', error);
      toast.error('Failed to delete file');
    } finally {
      setFileToDelete(null);
    }
  };

  const handleUploadClick = () => {
    uploadInputRef.current?.click();
  };

  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const toastId = toast.loading('Uploading files...');
    for (const file of Array.from(files)) {
      try {
        await sporaeClient.write(`${currentPath === '/' ? '' : currentPath}/${file.name}`, file);
      } catch (err) {
        console.error(err);
        toast.error(`Failed to upload ${file.name}`, { id: toastId });
      }
    }
    toast.success('Upload complete', { id: toastId });
    refetchFiles();
    if (uploadInputRef.current) uploadInputRef.current.value = '';
  };

  const handleFileClick = async (file: ServerFile) => {
    try {
      const blob = await sporaeClient.read(file.path, true);
      const finalBlob = new Blob([blob], { type: file.content_type || blob.type });
      const url = window.URL.createObjectURL(finalBlob);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Failed to read file:', error);
      toast.error('Failed to open file');
    }
  };

  const handleFileDownload = async (e: React.MouseEvent | undefined, file: ServerFile) => {
    e?.stopPropagation();
    try {
      const blob = await sporaeClient.read(file.path, false);
      const finalBlob = blob.type ? blob : new Blob([blob], { type: file.content_type });
      const url = window.URL.createObjectURL(finalBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download file:', error);
      toast.error('Failed to download file');
    }
  };

  const handleLogout = () => {
    logout();
  };

  if (isProfileLoading) {
    return <LoadingPage message="Initializing..." />;
  }

  if (profileError || !userProfile) {
    return (
      <ErrorPage
        title="Authentication Required"
        message="Please log in to access your files."
        code={401}
        reset={() => sporaeClient.redirectToAuth()}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* Fixed Logo */}
      <div className="fixed top-6 left-6 z-50 flex items-center gap-3">
        <div className="h-10 w-10 bg-card/80 backdrop-blur-md border rounded-2xl flex items-center justify-center ">
          <img src="/logo.svg" alt="Fangi logo" className="h-6 w-6" />
        </div>
        <h1 className="text-lg font-medium tracking-tight bg-card/80 backdrop-blur-md px-4 py-2 rounded-xl text-quaternary">
          Fangi Explorer
        </h1>
      </div>

      {/* Fixed Profile */}
      <div className="fixed top-6 right-6 z-50">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-10 w-10 rounded-full cursor-pointer border bg-card/80 backdrop-blur-md hover:bg-card p-0"
            >
              <Avatar className="h-full w-full">
                <AvatarImage src={userProfile.image_url || undefined} alt={userProfile.username} />
                <AvatarFallback className="bg-primary/5 text-primary font-medium">
                  {userProfile.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm leading-none">{userProfile.username}</p>
                <p className="text-xs leading-none text-muted-foreground">{userProfile.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-red-600 focus:text-red-600 cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0 container mx-auto p-6 pt-24 max-w-8xl">
        <input
          type="file"
          ref={uploadInputRef}
          className="hidden"
          onChange={handleUploadFile}
          multiple
        />
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden flex flex-col flex-1 min-h-0">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-1 p-1 border-b bg-muted/30 text-sm overflow-x-auto whitespace-nowrap shrink-0 scrollbar-thin">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 cursor-pointer"
              onClick={() => navigateTo('/')}
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
                    onClick={() => navigateTo(path)}
                  >
                    {part}
                  </Button>
                </div>
              );
            })}
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-2 p-2 border-b text-sm bg-background/50 min-h-[40px]">
            <div className="flex-1 pl-2 text-muted-foreground font-medium text-xs uppercase tracking-wider">
              {files.length} items
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs font-medium text-muted-foreground hover:text-foreground"
                onClick={handleCreateFolder}
              >
                <FolderPlus className="mr-2 h-3.5 w-3.5" />
                New Folder
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs font-medium text-muted-foreground hover:text-foreground"
                onClick={handleUploadClick}
              >
                <Upload className="mr-2 h-3.5 w-3.5" />
                Upload
              </Button>
            </div>
          </div>

          {/* File List Header */}
          <div className="grid grid-cols-[40px_1fr_120px_150px_120px_150px_40px] gap-4 px-4 py-2 border-b bg-muted/20 text-xs text-muted-foreground hidden md:grid shrink-0">
            <div></div>
            <div>Name</div>
            <div>Created By</div>
            <div>Created At</div>
            <div>Updated By</div>
            <div>Updated At</div>
            <div></div>
          </div>

          {/* File List */}
          <div className="flex-1 relative min-h-0">
            {isFilesLoading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filesError ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-destructive p-4 text-center">
                <p className="font-semibold mb-2">Error loading files</p>
                <p className="text-sm text-muted-foreground mb-4">
                  {(filesError as Error).message}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="cursor-pointer"
                  onClick={() => refetchFiles()}
                >
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
                            navigateTo(parentPath);
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
                              const parentPath =
                                currentPath.split('/').slice(0, -1).join('/') || '/';
                              navigateTo(parentPath);
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
                                      navigateTo(file.path);
                                    } else {
                                      handleFileClick(file);
                                    }
                                  }}
                                >
                                  <div className="h-8 w-8 rounded-md flex items-center justify-center shrink-0">
                                    <ContentTypeIcon
                                      contentType={
                                        file.is_directory ? 'directory' : file.content_type
                                      }
                                      className={cn('size-5', file.is_directory ? 'text-primary' : 'text-tertiary')}
                                    />
                                  </div>

                                  <div className="min-w-0" onClick={e => {
                                      if (renamingFile?.path === file.path) e.stopPropagation();
                                  }}>
                                    {renamingFile?.path === file.path ? (
                                      <Input
                                        value={renamingName}
                                        onChange={(e) => setRenamingName(e.target.value)}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') handleRenameSubmit();
                                          if (e.key === 'Escape') handleRenameCancel();
                                          e.stopPropagation();
                                        }}
                                        onBlur={handleRenameSubmit}
                                        onClick={(e) => e.stopPropagation()}
                                        autoFocus
                                        className="h-7 py-1 text-sm"
                                      />
                                    ) : (
                                      <>
                                        <p className="text-sm truncate font-medium leading-tight">
                                          {file.name}
                                        </p>
                                        <p className="md:hidden text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-0.5">
                                          {file.is_directory
                                            ? 'Directory'
                                            : file.content_type?.split('/').pop() || 'File'}
                                        </p>
                                      </>
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
                                        onClick={e => handleFileDownload(e, file)}
                                        title="Download"
                                      >
                                        <Download className="h-4 w-4 text-muted-foreground" />
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </ContextMenuTrigger>
                              <ContextMenuContent>
                                {file.is_directory ? (
                                  <ContextMenuItem onClick={() => navigateTo(file.path)}>
                                    <FolderOpen className="mr-2 h-4 w-4" /> Open folder
                                  </ContextMenuItem>
                                ) : (
                                  <>
                                    <ContextMenuItem onClick={() => handleFileClick(file)}>
                                      <Eye className="mr-2 h-4 w-4" /> View file
                                    </ContextMenuItem>
                                    <ContextMenuItem
                                      onClick={() => handleFileDownload(undefined, file)}
                                    >
                                      <Download className="mr-2 h-4 w-4" /> Download file
                                    </ContextMenuItem>
                                  </>
                                )}
                                <ContextMenuSeparator />
                                <ContextMenuItem onClick={() => handleRenameFile(file)}>
                                  <Pencil className="mr-2 h-4 w-4" /> Rename file
                                </ContextMenuItem>
                                <ContextMenuItem
                                  onClick={() => handleDeleteClick(file)}
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
                  <ContextMenuItem onClick={handleCreateFolder}>
                    <FolderPlus className="mr-2 h-4 w-4" /> Create new folder
                  </ContextMenuItem>
                  <ContextMenuItem onClick={handleUploadClick}>
                    <Upload className="mr-2 h-4 w-4" /> Upload file
                  </ContextMenuItem>
                  <ContextMenuItem onClick={() => refetchFiles()}>
                    <RefreshCw className="mr-2 h-4 w-4" /> Refresh
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            )}
          </div>
        </div>
      </main>

      <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateFolderSubmit}>
            <div className="grid gap-4 py-4">
              <Input
                id="name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Folder name"
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setIsCreateFolderOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!fileToDelete} onOpenChange={() => setFileToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete{' '}
              <span className="font-medium text-foreground">{fileToDelete?.name}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
