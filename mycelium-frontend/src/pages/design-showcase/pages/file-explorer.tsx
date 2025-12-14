import { memo } from 'react';
import { HomeIcon, FolderIcon, FileIcon, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Card } from '@/components/ui/card';
import { FolderPlus, Upload } from 'lucide-react';
import * as React from 'react';
import * as AvatarPrimitive from '@radix-ui/react-avatar';

import { cn } from '@/lib/utils';

function Avatar({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn('relative flex size-8 shrink-0 overflow-hidden rounded-full', className)}
      {...props}
    />
  );
}

function AvatarImage({ className, ...props }: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn('aspect-square size-full', className)}
      {...props}
    />
  );
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn('bg-muted flex size-full items-center justify-center rounded-full', className)}
      {...props}
    />
  );
}

interface ServerFile {
  name: string;
  path: string;
  is_directory: boolean;
  content_type?: string;
  created_by?: string;
  created_at: string;
  updated_by?: string;
  updated_at: string;
}

const mockFiles: ServerFile[] = [
  {
    name: 'Documents',
    path: '/Documents',
    is_directory: true,
    created_by: 'Mikhai Buinouskiy',
    created_at: '2024-01-15T10:30:00Z',
    updated_by: 'Mikhai Buinouskiy',
    updated_at: '2024-01-15T10:30:00Z',
  },
  {
    name: 'Images',
    path: '/Images',
    is_directory: true,
    created_by: 'Mikhai Buinouskiy',
    created_at: '2024-01-14T14:20:00Z',
    updated_by: 'Mikhai Buinouskiy',
    updated_at: '2024-01-14T14:20:00Z',
  },
  {
    name: 'Videos',
    path: '/Videos',
    is_directory: true,
    created_by: 'Mikhai Buinouskiy',
    created_at: '2024-01-13T16:45:00Z',
    updated_by: 'Mikhai Buinouskiy',
    updated_at: '2024-01-13T16:45:00Z',
  },
  {
    name: 'readme.txt',
    path: '/readme.txt',
    is_directory: false,
    content_type: 'text/plain',
    created_by: 'Mikhai Buinouskiy',
    created_at: '2024-01-12T09:15:00Z',
    updated_by: 'Mikhai Buinouskiy',
    updated_at: '2024-01-12T09:15:00Z',
  },
  {
    name: 'config.json',
    path: '/config.json',
    is_directory: false,
    content_type: 'application/json',
    created_by: 'Anton Antonov',
    created_at: '2024-01-11T11:30:00Z',
    updated_by: 'Anton Antonov',
    updated_at: '2024-01-11T11:30:00Z',
  },
  {
    name: 'logo.png',
    path: '/logo.png',
    is_directory: false,
    content_type: 'image/png',
    created_by: 'Anton Antonov',
    created_at: '2024-01-10T13:45:00Z',
    updated_by: 'Anton Antonov',
    updated_at: '2024-01-10T13:45:00Z',
  },
  {
    name: 'presentation.pdf',
    path: '/presentation.pdf',
    is_directory: false,
    content_type: 'application/pdf',
    created_by: 'Mikhai Buinouskiy',
    created_at: '2024-01-09T15:20:00Z',
    updated_by: 'Mikhai Buinouskiy',
    updated_at: '2024-01-09T15:20:00Z',
  },
];

const FileBreadcrumbs = memo(function FileBreadcrumbs() {
  return (
    <Breadcrumb className="border-b bg-muted/30 p-1 shrink-0">
      <BreadcrumbList className="flex-nowrap overflow-x-auto whitespace-nowrap scrollbar-thin sm:gap-1 px-1">
        <BreadcrumbItem>
          <BreadcrumbLink className="flex items-center cursor-pointer p-1 rounded-md hover:bg-muted/50 transition-colors">
            <HomeIcon className="h-4 w-4" />
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage className="px-2 font-medium">File Directory 1</BreadcrumbPage>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage className="px-2 font-medium">File Directory 2</BreadcrumbPage>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage className="px-2 font-medium">File Directory 3</BreadcrumbPage>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage className="px-2 font-medium">File Directory 4</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
});

const FileToolbar = memo(function FileToolbar() {
  return (
    <div className="flex items-center gap-2 p-2 border-b text-sm bg-background/50 min-h-[40px]">
      <div className="flex-1 pl-2 text-muted-foreground font-medium text-xs uppercase tracking-wider">
        {mockFiles.length} items
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <FolderPlus className="mr-2 h-3.5 w-3.5" />
          New Folder
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <Upload className="mr-2 h-3.5 w-3.5" />
          Upload
        </Button>
      </div>
    </div>
  );
});

const FileList = memo(function FileList() {
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
        <ScrollArea className="h-full">
          <div className="p-2 pr-4 flex flex-col gap-1 min-h-full">
            {mockFiles
              .sort((a, b) => {
                if (a.is_directory && !b.is_directory) return -1;
                if (!a.is_directory && b.is_directory) return 1;
                return a.name.localeCompare(b.name);
              })
              .map(file => (
                <div
                  key={file.path}
                  className={`group grid grid-cols-[auto_1fr_auto] md:grid-cols-[40px_1fr_120px_150px_120px_150px_40px] items-center gap-4 p-2 rounded-lg border border-transparent hover:border-border hover:bg-accent/50 transition-all cursor-pointer ${
                    file.is_directory ? 'bg-accent/10' : ''
                  }`}
                >
                  <div className="h-8 w-8 rounded-md flex items-center justify-center shrink-0">
                    {file.is_directory ? (
                      <FolderIcon className="size-5 text-primary" />
                    ) : (
                      <FileIcon className="size-5 text-tertiary" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm truncate font-medium leading-tight">{file.name}</p>
                    <p className="md:hidden text-xs text-muted-foreground uppercase tracking-wider font-semibold mt-0.5">
                      {file.is_directory
                        ? 'Directory'
                        : file.content_type?.split('/').pop() || 'File'}
                    </p>
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
                        title="Download"
                      >
                        <Download className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </ScrollArea>
      </div>
    </>
  );
});

const UserAvatar = memo(function UserAvatar() {
  return (
    <div className="fixed top-6 right-6 z-50">
      <Avatar className="h-8 w-8">
        <AvatarImage src="" alt="User avatar" />
        <AvatarFallback className="bg-primary/5 text-primary font-medium">JD</AvatarFallback>
      </Avatar>
    </div>
  );
});

export const BrandLogo = memo(function MainHeader() {
  return (
    <div className="fixed top-6 left-6 z-50 flex items-center gap-3">
      <div className="h-10 w-10 bg-card/80 backdrop-blur-md border rounded-xl flex items-center justify-center ">
        <img src="/logo.svg" alt="Fangi logo" className="h-6 w-6" />
      </div>
      <h1 className="text-lg font-medium tracking-tight bg-card/80 backdrop-blur-md px-4 py-2 rounded-xl text-quaternary">
        Fangi Explorer
      </h1>
    </div>
  );
});

export default function FileExplorerPage() {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <BrandLogo />
      <UserAvatar />

      <main className="flex-1 flex flex-col min-h-0 container mx-auto p-6 pt-24 max-w-8xl justify-center">
        <Card className="overflow-hidden flex flex-col h-[600px] gap-0 p-0 mx-auto max-w-7xl w-full">
          <FileBreadcrumbs />
          <FileToolbar />
          <FileList />
        </Card>
      </main>
    </div>
  );
}
