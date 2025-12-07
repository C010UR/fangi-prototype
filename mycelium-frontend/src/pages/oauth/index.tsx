import { useState, useRef, useEffect, useMemo, memo, useCallback } from 'react';
import { useNavigate, useLocation } from '@tanstack/react-router';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import {
  AlertCircle,
  Check,
  ChevronLeft,
  ChevronRight,
  Folder,
  Home,
  Loader2,
  Search,
  Trash2,
  UploadCloud,
} from 'lucide-react';
import { List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

import { ContentTypeIcon } from '@/components/ui/content-type-icon';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  TwoPaneCard,
  TwoPaneCardContent,
  TwoPaneCardHeader,
  TwoPaneCardTitle,
  TwoPaneCardDescription,
  TwoPaneCardBody,
  TwoPaneCardFooter,
} from '@/components/pages/two-pane-card';
import { BrandLogo } from '@/components/pages/brand-logo';
import { type Server, type ListResult, type ServerFile, type Module } from '@/types';
import { ApiRoutes, fangiFetch } from '@/lib/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type FileRowData = {
  files: ServerFile[];
  isSelected: (file: ServerFile) => boolean;
  isAncestorSelected: boolean;
  onFileToggle: (file: ServerFile) => void;
  navigateTo: (path: string) => void;
};

type RowProps = {
  data: FileRowData;
};

function ServerList({
  selectedId,
  onSelect,
}: {
  selectedId?: number;
  onSelect: (server: Server) => void;
}) {
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setQuery(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ['servers', 'active', query],
    queryFn: async ({ pageParam = 1 }) => {
      return fangiFetch<ListResult<Server>>({
        route: ApiRoutes.SERVER.LIST_ACTIVE,
        params: {
          q: query,
          page: pageParam,
          page_size: 20,
        },
        useCredentials: true,
      });
    },
    getNextPageParam: lastPage => {
      if (lastPage.meta.page < lastPage.meta.total_pages) {
        return lastPage.meta.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, fetchNextPage]);

  const servers = useMemo(() => {
    return data?.pages.flatMap(page => page.data) || [];
  }, [data]);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search servers..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-8"
        />
      </div>

      <div className="rounded-md border">
        <ScrollArea className="h-[350px]">
          <div className="p-2 space-y-1">
            {isLoading && (
              <div className="p-4 text-sm text-center text-muted-foreground">Loading...</div>
            )}
            {!isLoading && servers.length === 0 && (
              <div className="p-4 text-sm text-center text-muted-foreground">No servers found.</div>
            )}
            {servers.map(server => {
              const isSelected = selectedId === server.id;
              return (
                <div
                  key={server.id}
                  onClick={() => onSelect(server)}
                  className={`flex items-center gap-3 p-3 rounded-md cursor-pointer transition-colors ${
                    isSelected ? 'bg-accent' : 'hover:bg-muted/50'
                  }`}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={server.image_url || undefined} alt={server.name} />
                    <AvatarFallback>{server.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-sm font-medium truncate">{server.name}</span>
                    <span className="text-xs text-muted-foreground truncate">
                      ID: {server.client_id}
                    </span>
                  </div>
                  {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
                </div>
              );
            })}
            {hasNextPage && (
              <div ref={observerTarget} className="p-2 text-center text-xs text-muted-foreground">
                {isFetchingNextPage ? 'Loading more...' : 'Load more'}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

const FileRow = memo(
  ({ data, index, style }: { data: FileRowData; index: number; style: React.CSSProperties }) => {
    const file = data.files[index];
    const selected = data.isSelected(file);
    const parentSelected = data.isAncestorSelected;
    const disabled = parentSelected;

    return (
      <div style={style} className="p-1">
        <div
          className={cn(
            'flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors group h-full',
            selected || parentSelected ? 'bg-primary/10' : 'hover:bg-accent/50'
          )}
          onClick={e => {
            if (file.is_directory) {
              e.preventDefault();
              data.navigateTo(file.path);
            } else if (!disabled) {
              data.onFileToggle(file);
            }
          }}
        >
          <ContentTypeIcon
            contentType={file.is_directory ? 'directory' : file.content_type}
            className={cn(
              'h-5 w-5 shrink-0',
              file.is_directory ? 'text-primary fill-primary/20' : 'text-muted-foreground'
            )}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{file.name}</p>
            <p className="text-xs text-muted-foreground">
              {file.is_directory ? 'Directory' : file.content_type || 'File'}
            </p>
          </div>

          <div
            className={cn(
              'self-stretch flex items-center justify-center pl-4 -my-2 -mr-2 pr-2 z-10 cursor-pointer group/checkbox',
              disabled && 'cursor-not-allowed'
            )}
            onClick={e => {
              e.stopPropagation();
              if (!disabled) {
                data.onFileToggle(file);
              }
            }}
          >
            <div
              className={cn(
                'h-4 w-4 border rounded-sm flex items-center justify-center transition-colors',
                selected || parentSelected
                  ? 'bg-primary border-primary text-primary-foreground'
                  : 'border-muted-foreground/30 group-hover/checkbox:border-primary/50',
                disabled && 'opacity-50'
              )}
            >
              {(selected || parentSelected) && <Check className="h-3 w-3" />}
            </div>
          </div>
        </div>
      </div>
    );
  },
  (prev, next) => {
    const prevFile = prev.data.files[prev.index];
    const nextFile = next.data.files[next.index];

    return (
      prevFile === nextFile &&
      prev.style === next.style &&
      prev.data.isSelected(prevFile) === next.data.isSelected(nextFile) &&
      prev.data.isAncestorSelected === next.data.isAncestorSelected
    );
  }
);

const FileList = memo(
  ({
    height,
    width,
    files,
    isSelected,
    isAncestorSelected,
    onFileToggle,
    navigateTo,
  }: {
    height: number;
    width: number;
    files: ServerFile[];
    isSelected: (file: ServerFile) => boolean;
    isAncestorSelected: boolean;
    onFileToggle: (file: ServerFile) => void;
    navigateTo: (path: string) => void;
  }) => {
    const sortedFiles = useMemo(() => {
      return [...files].sort((a, b) => {
        if (a.is_directory === b.is_directory) return a.name.localeCompare(b.name);
        return a.is_directory ? -1 : 1;
      });
    }, [files]);

    const rowProps = useMemo(
      () => ({
        data: {
          files: sortedFiles,
          isSelected,
          isAncestorSelected,
          onFileToggle,
          navigateTo,
        },
      }),
      [sortedFiles, isSelected, isAncestorSelected, onFileToggle, navigateTo]
    );

    return (
      <div style={{ height, width }}>
        <List<RowProps>
          className="scrollbar-thin"
          style={{ width: '100%', height: '100%' }}
          rowCount={sortedFiles.length}
          rowHeight={60}
          rowProps={rowProps}
          rowComponent={FileRow as any}
        />
      </div>
    );
  }
);

function FileBrowser({
  serverId,
  selectedFiles,
  onFileToggle,
  onBatchToggle,
}: {
  serverId: number;
  selectedFiles: ServerFile[];
  onFileToggle: (file: ServerFile) => void;
  onBatchToggle: (files: ServerFile[], select: boolean) => void;
}) {
  const [currentPath, setCurrentPath] = useState('/');

  const {
    data: files,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['server-files', serverId, currentPath],
    queryFn: async () => {
      return fangiFetch<ServerFile[]>({
        route: ApiRoutes.SERVER.LS(serverId, currentPath),
        useCredentials: true,
      });
    },
  });

  const pathParts = useMemo(() => {
    return currentPath.split('/').filter(Boolean);
  }, [currentPath]);

  const navigateTo = useCallback((path: string) => {
    setCurrentPath(path);
  }, []);

  const navigateUp = () => {
    if (currentPath === '/') return;
    const parentPath = currentPath.split('/').slice(0, -1).join('/') || '/';
    setCurrentPath(parentPath);
  };

  const selectedPathSet = useMemo(() => new Set(selectedFiles.map(f => f.path)), [selectedFiles]);

  const isAncestorSelected = useMemo(() => {
    const parts = currentPath.split('/').filter(Boolean);
    let path = '';

    for (const part of parts) {
      path += '/' + part;
      if (selectedPathSet.has(path)) return true;
    }

    if (selectedPathSet.has('/')) return true;

    return false;
  }, [currentPath, selectedPathSet]);

  const isSelected = useCallback(
    (file: ServerFile) => {
      return selectedPathSet.has(file.path);
    },
    [selectedPathSet]
  );

  const isCurrentFolderSelected = selectedPathSet.has(currentPath);

  const isParentSelected = useMemo(() => {
    if (currentPath === '/') return false;
    const parts = currentPath.split('/').filter(Boolean);
    let path = '';

    if (selectedPathSet.has('/')) return true;

    for (let i = 0; i < parts.length - 1; i++) {
      path += '/' + parts[i];
      if (selectedPathSet.has(path)) return true;
    }

    return false;
  }, [currentPath, selectedPathSet]);

  const handleSelectCurrentFolder = useCallback(() => {
    if (isParentSelected) return;

    const name = currentPath === '/' ? '' : currentPath.split('/').pop() || '';
    const parent =
      currentPath === '/' ? null : currentPath.split('/').slice(0, -1).join('/') || '/';

    const file: ServerFile = {
      path: currentPath,
      parent,
      name,
      content_type: 'directory',
      is_directory: true,
      created_by: null,
      updated_by: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    onFileToggle(file);
  }, [currentPath, isParentSelected, onFileToggle]);

  const selectableFiles = useMemo(() => {
    if (!files) return [];
    if (isAncestorSelected) return [];

    return files;
  }, [files, isAncestorSelected]);

  const areAllSelected = useMemo(() => {
    if (!selectableFiles.length) return false;
    return selectableFiles.every(f => selectedPathSet.has(f.path));
  }, [selectableFiles, selectedPathSet]);

  const handleSelectAll = () => {
    onBatchToggle(selectableFiles, !areAllSelected);
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-destructive p-4">
        <p>Error loading files</p>
        <p className="text-sm text-muted-foreground">{(error as Error).message}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full border rounded-md bg-background overflow-hidden">
      <div className="flex items-center gap-1 p-2 border-b bg-muted/30 text-sm overflow-x-auto whitespace-nowrap shrink-0 scrollbar-thin">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 cursor-pointer"
          onClick={() => navigateTo('/')}
          disabled={currentPath === '/'}
        >
          <Home className="h-4 w-4" />
        </Button>
        {pathParts.map((part, index) => {
          const path = '/' + pathParts.slice(0, index + 1).join('/');
          return (
            <div key={path} className="flex items-center">
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs cursor-pointer"
                onClick={() => navigateTo(path)}
              >
                {part}
              </Button>
            </div>
          );
        })}
      </div>

      {!isLoading && !error && files && files.length > 0 && (
        <div className="flex items-center gap-2 p-2 border-b text-sm bg-background/50 min-h-[40px]">
          <div className="flex-1 pl-2 text-muted-foreground font-medium text-xs uppercase tracking-wider">
            {selectableFiles.length} items
          </div>
          <div
            className={cn(
              'flex items-center gap-2 cursor-pointer hover:bg-accent/50 p-1 rounded-md transition-colors mr-2',
              isParentSelected && 'opacity-50 cursor-not-allowed'
            )}
            onClick={isParentSelected ? undefined : handleSelectCurrentFolder}
          >
            <span className="text-xs text-muted-foreground font-medium select-none">
              Select current folder
            </span>
            <Checkbox
              checked={isCurrentFolderSelected || isParentSelected}
              onCheckedChange={isParentSelected ? undefined : handleSelectCurrentFolder}
              id="select-current-folder"
              className="mr-1"
            />
          </div>
          <div
            className="flex items-center gap-2 cursor-pointer hover:bg-accent/50 p-1 rounded-md transition-colors"
            onClick={handleSelectAll}
          >
            <span className="text-xs text-muted-foreground font-medium select-none">
              Select All
            </span>
            <Checkbox
              checked={areAllSelected}
              onCheckedChange={handleSelectAll}
              id="select-all"
              className="mr-1"
            />
          </div>
        </div>
      )}

      <div className="flex-1 min-h-0 relative">
        <div className="h-full w-full">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="h-full flex flex-col">
              {currentPath !== '/' && (
                <div
                  className="flex items-center gap-3 p-4 rounded-md hover:bg-accent/50 cursor-pointer text-muted-foreground shrink-0 border-b"
                  onClick={navigateUp}
                >
                  <Folder className="h-5 w-5 fill-muted/30" />
                  <span className="text-sm">..</span>
                </div>
              )}
              {files?.length === 0 && (
                <div className="text-center py-8 text-sm text-muted-foreground">No files found</div>
              )}

              <div className="flex-1 min-h-0">
                {files && files.length > 0 && (
                  <AutoSizer disableHeight={false} disableWidth={false}>
                    {({ height, width }) => (
                      <FileList
                        height={height}
                        width={width}
                        files={files}
                        isSelected={isSelected}
                        isAncestorSelected={isAncestorSelected}
                        onFileToggle={onFileToggle}
                        navigateTo={navigateTo}
                      />
                    )}
                  </AutoSizer>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SelectedFilesList({
  files,
  onRemove,
  onClear,
}: {
  files: ServerFile[];
  onRemove: (file: ServerFile) => void;
  onClear: () => void;
}) {
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
              <div className="text-center py-8 text-sm text-muted-foreground">
                No files selected
              </div>
            )}
            {files.map(file => (
              <div
                key={file.path}
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
                        <bdo dir="ltr">{file.path}</bdo>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{file.path}</p>
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
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

export default function AuthorizePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const clientId = searchParams.get('client_id');
  const redirectUri = searchParams.get('redirect_uri');
  const state = searchParams.get('state');
  const nonce = searchParams.get('nonce');

  const {
    data: moduleData,
    isLoading: isModuleLoading,
    error: moduleError,
  } = useQuery({
    queryKey: ['module', clientId],
    queryFn: async () => {
      if (!clientId) throw new Error('Client ID is required');
      return fangiFetch<Module>({
        route: ApiRoutes.MODULES.GET(clientId),
        useCredentials: true,
      });
    },
    enabled: !!clientId,
    retry: false,
  });

  const [step, setStep] = useState<'server' | 'file'>('server');
  const [selectedServer, setSelectedServer] = useState<Server | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<ServerFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleServerSelect = (server: Server) => {
    setSelectedServer(server);
  };

  const handleFileToggle = useCallback((file: ServerFile) => {
    setSelectedFiles(prev => {
      const exists = prev.some(f => f.path === file.path);
      let newFiles: ServerFile[];

      if (exists) {
        newFiles = prev.filter(f => f.path !== file.path);
      } else {
        newFiles = [
          ...prev.filter(f => !(file.is_directory && f.path.startsWith(file.path + '/'))),
          file,
        ];
      }

      return newFiles.sort((a, b) => a.path.localeCompare(b.path));
    });
  }, []);

  const handleFileRemove = useCallback((file: ServerFile) => {
    setSelectedFiles(prev => prev.filter(f => f.path !== file.path));
  }, []);

  const handleBatchToggle = useCallback((files: ServerFile[], select: boolean) => {
    setSelectedFiles(prev => {
      if (!select) {
        const pathsToRemove = new Set(files.map(f => f.path));
        return prev
          .filter(f => !pathsToRemove.has(f.path))
          .sort((a, b) => a.path.localeCompare(b.path));
      }

      const existingPaths = new Set(prev.map(f => f.path));
      const newDirs = files.filter(f => f.is_directory);

      let nextFiles = [...prev];
      if (newDirs.length > 0) {
        nextFiles = nextFiles.filter(f => !newDirs.some(dir => f.path.startsWith(dir.path + '/')));
      }

      for (const file of files) {
        if (!existingPaths.has(file.path)) {
          nextFiles.push(file);
        }
      }

      return nextFiles.sort((a, b) => a.path.localeCompare(b.path));
    });
  }, []);

  const handleClearFiles = useCallback(() => {
    setSelectedFiles([]);
  }, []);

  const handleContinue = () => {
    if (step === 'server' && selectedServer) {
      setStep('file');
    } else if (step === 'file' && selectedFiles.length > 0) {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step === 'file') {
      setStep('server');
      setSelectedFiles([]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedServer || selectedFiles.length === 0) return;

    setIsSubmitting(true);
    try {
      await fangiFetch({
        route: ApiRoutes.OAUTH.AUTHORIZE,
        method: 'POST',
        params: {
          client_id: clientId || undefined,
          redirect_uri: redirectUri || undefined,
          state: state || undefined,
          nonce: nonce || undefined,
        },
        body: {
          server: selectedServer.id,
          files: selectedFiles.map(f => f.path),
        },
        useCredentials: true,
      });

      toast.success('Authorization successful');

      navigate({ to: '/' });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Authorization failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!clientId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-6 text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Missing Client ID</h2>
              <p className="text-sm text-muted-foreground">
                The authorization request is missing a client identifier.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (moduleError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-6 text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Invalid Application</h2>
              <p className="text-sm text-muted-foreground">
                The application requesting authorization could not be found.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isModuleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (step === 'server') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <TwoPaneCard imageSrc="/card-image.jpeg" imageAlt="Authorization" className="h-[800px]">
          <TwoPaneCardContent>
            <TwoPaneCardHeader>
              <TwoPaneCardTitle>Authorize Access</TwoPaneCardTitle>
              <TwoPaneCardDescription>Select a server to authorize</TwoPaneCardDescription>
              {moduleData && (
                <div className="flex items-center gap-3 mt-4 p-2 pr-4 border rounded-md bg-muted/30 w-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={moduleData.image_url || undefined} alt={moduleData.name} />
                    <AvatarFallback>{moduleData.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">{moduleData.name}</span>
                    <span className="text-xs text-muted-foreground">{moduleData.urls?.[0]}</span>
                  </div>
                </div>
              )}
            </TwoPaneCardHeader>

            <TwoPaneCardBody className="space-y-6">
              <div className="flex items-center gap-2 w-full">
                <div className="h-1.5 flex-1 rounded-full bg-primary" />
                <div className="h-1.5 flex-1 rounded-full bg-muted" />
              </div>
              <div className="space-y-4">
                <ServerList selectedId={selectedServer?.id} onSelect={handleServerSelect} />
              </div>
            </TwoPaneCardBody>

            <TwoPaneCardFooter>
              <Button className="w-full" onClick={handleContinue} disabled={!selectedServer}>
                Continue
              </Button>
            </TwoPaneCardFooter>
          </TwoPaneCardContent>
        </TwoPaneCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <BrandLogo />
      <Card className="w-full max-w-6xl h-[800px] flex flex-col z-10">
        <CardHeader className="border-b px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 -ml-2 cursor-pointer"
              onClick={handleBack}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-4 flex-1 overflow-hidden">
              <CardTitle className="text-base shrink-0">Select Files</CardTitle>

              {(moduleData || selectedServer) && <div className="h-8 w-px bg-border shrink-0" />}

              <div className="flex items-center gap-3 min-w-0 overflow-hidden text-sm">
                {moduleData && (
                  <div className="flex items-center gap-2 shrink-0 max-w-[240px]">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarImage src={moduleData.image_url || undefined} alt={moduleData.name} />
                      <AvatarFallback className="text-xs">
                        {moduleData.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                      <span className="truncate font-medium leading-tight">{moduleData.name}</span>
                      <span className="text-xs text-muted-foreground truncate leading-tight">
                        {moduleData.urls?.[0]}
                      </span>
                    </div>
                  </div>
                )}

                {moduleData && selectedServer && (
                  <span className="text-muted-foreground/40 shrink-0 text-lg font-light">/</span>
                )}

                {selectedServer && (
                  <div className="flex items-center gap-2 shrink-0 max-w-[240px]">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarImage
                        src={selectedServer.image_url || undefined}
                        alt={selectedServer.name}
                      />
                      <AvatarFallback className="text-xs">
                        {selectedServer.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                      <span className="truncate font-medium leading-tight">
                        {selectedServer.name}
                      </span>
                      <span className="text-xs text-muted-foreground truncate leading-tight">
                        {selectedServer.urls?.[0] || selectedServer.url}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 p-0 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 h-full divide-y md:divide-y-0 md:divide-x">
            <div className="md:col-span-2 flex flex-col h-full px-4 overflow-hidden min-w-0">
              <div className="flex-1 min-h-0">
                {selectedServer && (
                  <FileBrowser
                    serverId={selectedServer.id}
                    selectedFiles={selectedFiles}
                    onFileToggle={handleFileToggle}
                    onBatchToggle={handleBatchToggle}
                  />
                )}
              </div>
            </div>

            <div className="flex flex-col h-full px-4 overflow-hidden min-w-0">
              <div className="flex-1 min-h-0">
                <SelectedFilesList
                  files={selectedFiles}
                  onRemove={handleFileRemove}
                  onClear={handleClearFiles}
                />
              </div>

              <div className="mt-4 space-y-2">
                <Button
                  className="w-full cursor-pointer"
                  onClick={handleSubmit}
                  disabled={selectedFiles.length === 0 || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Authorizing...
                    </>
                  ) : (
                    <span className="flex items-center gap-2">
                      <UploadCloud className="h-4 w-4" />
                      Authorize Selected ({selectedFiles.length})
                    </span>
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="w-full cursor-pointer"
                  onClick={handleBack}
                  disabled={isSubmitting}
                >
                  Back to Servers
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
