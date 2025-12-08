import { useState, useCallback, useMemo, memo, Fragment } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Check, Folder, Home, AlertCircle } from 'lucide-react';
import { List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

import { ContentTypeIcon } from '@/components/ui/content-type-icon';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Spinner } from '@/components/ui/spinner';
import { Empty, EmptyDescription, EmptyTitle, EmptyMedia } from '@/components/ui/empty';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { cn } from '@/lib/utils';
import { type ServerFile } from '@/types';
import { ApiRoutes, fangiFetch } from '@/lib/api';

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
          rowComponent={FileRow as any} // eslint-disable-line @typescript-eslint/no-explicit-any
        />
      </div>
    );
  }
);

interface FileBrowserProps {
  serverId: number;
  selectedFiles: ServerFile[];
  onFileToggle: (file: ServerFile) => void;
  onBatchToggle: (files: ServerFile[], select: boolean) => void;
}

export function FileBrowser({
  serverId,
  selectedFiles,
  onFileToggle,
  onBatchToggle,
}: FileBrowserProps) {
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
      <Empty className="h-full border-none">
        <EmptyMedia className="text-destructive">
          <AlertCircle className="size-10" />
        </EmptyMedia>
        <EmptyTitle className="text-destructive">Error loading files</EmptyTitle>
        <EmptyDescription>{(error as Error).message}</EmptyDescription>
      </Empty>
    );
  }

  return (
    <div className="flex flex-col h-full border rounded-md bg-background overflow-hidden">
      <div className="flex items-center gap-1 p-2 border-b bg-muted/30 text-sm overflow-x-auto whitespace-nowrap shrink-0 scrollbar-thin">
        <Breadcrumb>
          <BreadcrumbList className="flex-nowrap sm:gap-1.5">
            <BreadcrumbItem>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 cursor-pointer"
                onClick={() => navigateTo('/')}
                disabled={currentPath === '/'}
              >
                <Home className="h-4 w-4" />
              </Button>
            </BreadcrumbItem>
            {pathParts.map((part, index) => {
              const path = '/' + pathParts.slice(0, index + 1).join('/');
              return (
                <Fragment key={path}>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs cursor-pointer"
                      onClick={() => navigateTo(path)}
                    >
                      {part}
                    </Button>
                  </BreadcrumbItem>
                </Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {!isLoading && !error && files && files.length > 0 && (
        <div className="flex items-center gap-2 p-2 border-b text-sm bg-background/50 min-h-[40px]">
          <div className="flex-1 pl-2 text-muted-foreground font-medium text-xs uppercase tracking-wider">
            {files.length} items
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
              <Spinner className="h-6 w-6 text-muted-foreground" />
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
                <Empty className="py-8 border-none">
                  <EmptyDescription>No files found</EmptyDescription>
                </Empty>
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
