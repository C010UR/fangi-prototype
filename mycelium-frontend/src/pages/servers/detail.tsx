import * as React from 'react';
import { useParams } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  type ColumnDef,
  type SortingState,
  type ExpandedState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { SidePanel } from '@/components/pages/side-panel';
import { PageHeader } from '@/components/pages/page-header';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ListPagination } from '@/components/ui/list-pagination';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Code } from '@/components/ui/code';
import { Spinner } from '@/components/ui/spinner';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useList } from '@/hooks/use-list';
import { useDebouncedCallback } from '@/hooks/use-debounced-callback';
import { ApiRoutes } from '@/lib/api';
import { fangiFetch } from '@/lib/api/fetch';
import type { Server, ServerAllowedModule } from '@/types';
import { ServerModuleForm } from '@/pages/servers/components/server-module-form';
import { ChevronRight, ChevronDown, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { ServerActionsMenu } from '@/pages/servers/components/server-actions-menu';
import { ServerActionDialogs } from '@/pages/servers/components/server-action-dialogs';
import { useServerActions } from '@/hooks/use-server-actions';
import { usePermissions } from '@/hooks/use-permissions';
import { TruncatedList } from '@/components/ui/truncated-list';
import { getBaseUrl } from '@/lib/url';

export default function ServerDetailPage() {
  const { serverId } = useParams({ from: '/servers/$serverId' });
  const { isAdmin } = usePermissions();
  const [expanded, setExpanded] = React.useState<ExpandedState>({});
  const queryClient = useQueryClient();
  const [editingServer, setEditingServer] = React.useState<Server | null>(null);
  const [activateDialog, setActivateDialog] = React.useState<{
    open: boolean;
    server: Server | null;
  }>({
    open: false,
    server: null,
  });
  const [deactivateDialog, setDeactivateDialog] = React.useState<{
    open: boolean;
    server: Server | null;
  }>({
    open: false,
    server: null,
  });
  const [generateSecretDialog, setGenerateSecretDialog] = React.useState<{
    open: boolean;
    server: Server | null;
  }>({
    open: false,
    server: null,
  });

  const { data: server, isLoading: isServerLoading } = useQuery({
    queryKey: ['server', serverId],
    queryFn: () =>
      fangiFetch<Server>({
        route: ApiRoutes.SERVER.GET(serverId),
        method: 'GET',
        useCredentials: true,
      }),
  });

  const {
    data: modulesData,
    setParams,
    meta,
  } = useList<ServerAllowedModule>({
    route: ApiRoutes.SERVER_MODULES.LIST(serverId),
    queryKey: ['server-modules', serverId],
  });

  const { mutate: removeModule, isPending: isRemoving } = useMutation({
    mutationFn: async (moduleId: number) => {
      return fangiFetch({
        route: ApiRoutes.SERVER_MODULES.REMOVE(serverId, moduleId.toString()),
        method: 'POST',
        useCredentials: true,
      });
    },
    onSuccess: () => {
      toast.success('Module removed successfully');
      queryClient.invalidateQueries({ queryKey: ['server-modules', serverId] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to remove module');
    },
  });

  const { activateServer, deactivateServer, generateSecret } = useServerActions({
    onActivateSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['server', serverId] });
    },
    onDeactivateSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['server', serverId] });
    },
    onGenerateSecretSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['server', serverId] });
    },
  });

  const onSearch = useDebouncedCallback((value: string) => {
    setParams({ search: value });
  }, 500);

  const sorting = React.useMemo<SortingState>(() => {
    return (meta.orders || []).map(o => ({
      id: o.field,
      desc: o.order === 'desc',
    }));
  }, [meta.orders]);

  const columns = React.useMemo<ColumnDef<ServerAllowedModule>[]>(() => {
    const baseColumns: ColumnDef<ServerAllowedModule>[] = [
      {
        id: 'expander',
        size: 30,
        header: () => null,
        cell: ({ row }) => {
          return (
            <div className="flex items-center justify-center">
              {row.getIsExpanded() ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          );
        },
      },
      {
        accessorKey: 'module.image_url',
        header: 'Image',
        size: 60,
        cell: ({ row }) => {
          const name = row.original.module.name;
          const src = row.original.module.image_url;
          return (
            <Avatar className="h-8 w-8">
              <AvatarImage src={src || undefined} alt={name} />
              <AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
          );
        },
      },
      {
        accessorKey: 'module.name',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Module Name" />,
      },
    ];

    if (isAdmin) {
      baseColumns.push(
        {
          accessorKey: 'module.urls',
          header: 'Allowed URLs',
          size: 250,
          cell: ({ row }) => (
            <TruncatedList
              items={row.original.module.urls?.map(getBaseUrl)}
              title="Allowed URLs"
              emptyMessage={<Code>-</Code>}
              renderItem={url => <Code copy>{url}</Code>}
            />
          ),
        },
        {
          accessorKey: 'module.client_id',
          header: 'Client ID',
          cell: ({ row }) => <Code copy>{row.original.module.client_id}</Code>,
        }
      );
    }

    baseColumns.push(
      {
        accessorKey: 'created_by',
        header: 'Created By',
        cell: ({ row }) => row.original.created_by || '-',
      },
      {
        accessorKey: 'created_at',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Created At" />,
        cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString(),
      },
      {
        accessorKey: 'updated_at',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Updated At" />,
        cell: ({ row }) => new Date(row.original.updated_at).toLocaleDateString(),
      }
    );

    if (isAdmin) {
      baseColumns.push({
        id: 'actions',
        header: 'Actions',
        size: 80,
        cell: ({ row }) => {
          return (
            <AlertDialog>
              <AlertDialogTrigger asChild onClick={e => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={isRemoving}
                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent onClick={e => e.stopPropagation()}>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remove Module</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to remove <strong>{row.original.module.name}</strong> from
                    this server? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={e => {
                      e.stopPropagation();
                      removeModule(row.original.module.id);
                    }}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Remove
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          );
        },
      });
    }

    return baseColumns;
  }, [isAdmin, isRemoving, removeModule]);

  const table = useReactTable({
    data: modulesData?.data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    manualSorting: true,
    manualPagination: true,
    getRowCanExpand: () => true,
    state: {
      sorting,
      expanded,
    },
    onExpandedChange: setExpanded,
    onSortingChange: updater => {
      const newSorting = typeof updater === 'function' ? updater(sorting) : updater;
      setParams({
        orders: newSorting.map(s => ({
          field: s.id,
          order: s.desc ? 'desc' : 'asc',
        })),
      });
    },
  });

  if (isServerLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!server) {
    return <div>Server not found</div>;
  }

  return (
    <SidebarProvider>
      <SidePanel activeItem="servers" />
      <SidebarInset>
        <PageHeader title={`Server: ${server.name}`} />
        <div className="flex-1 p-4 flex flex-col gap-6">
          <div className="rounded-lg border p-4">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={server.image_url || undefined} alt={server.name} />
                  <AvatarFallback>{server.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-2">
                  <h2 className="text-xl font-bold">{server.name}</h2>
                  {isAdmin && (
                    <div className="flex flex-col gap-1">
                      <Code copy>{server.client_id}</Code>
                    </div>
                  )}
                </div>
              </div>
              {isAdmin && (
                <ServerActionsMenu
                  server={server}
                  onEdit={setEditingServer}
                  onActivate={server => setActivateDialog({ open: true, server })}
                  onDeactivate={server => setDeactivateDialog({ open: true, server })}
                  onGenerateSecret={server => setGenerateSecretDialog({ open: true, server })}
                />
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-3">
                {isAdmin && (
                  <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                    <span className="font-medium text-sm text-muted-foreground">Status</span>
                    <Badge variant={server.is_active ? 'default' : 'secondary'} className="w-fit">
                      {server.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                )}

                <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                  <span className="font-medium text-sm text-muted-foreground">Created By</span>
                  <span className="text-sm">{server.created_by || '-'}</span>
                </div>

                <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                  <span className="font-medium text-sm text-muted-foreground">Created At</span>
                  <span className="text-sm">{new Date(server.created_at).toLocaleString()}</span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {isAdmin && (
                  <div className="grid grid-cols-[100px_1fr] items-start gap-2">
                    <span className="font-medium text-sm text-muted-foreground pt-1">URLs</span>
                    <div className="flex flex-col gap-1">
                      {server.urls && server.urls.length > 0 ? (
                        server.urls.map((url, index) => (
                          <Code key={index} copy>
                            {url}
                          </Code>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-[100px_1fr] items-center gap-2">
                  <span className="font-medium text-sm text-muted-foreground">Updated At</span>
                  <span className="text-sm">{new Date(server.updated_at).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Modules</h3>
              <div className="flex items-center gap-2">
                <div className="w-72">
                  <Input
                    placeholder="Search modules..."
                    defaultValue={meta.search}
                    onChange={e => onSearch(e.target.value)}
                  />
                </div>
                {isAdmin && serverId && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4" />
                        Add Module
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="w-full sm:max-w-7xl max-h-[90vh] flex flex-col">
                      <DialogHeader>
                        <DialogTitle>Add Module to Server</DialogTitle>
                        <DialogDescription>
                          Select a module to add to this server.
                        </DialogDescription>
                      </DialogHeader>
                      <ServerModuleForm serverId={serverId} />
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>

            <div className="rounded-md border overflow-hidden">
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    {table.getHeaderGroups().map(headerGroup => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map(header => (
                          <TableHead
                            key={header.id}
                            style={{
                              width: header.column.columnDef.size,
                            }}
                          >
                            {header.isPlaceholder
                              ? null
                              : flexRender(header.column.columnDef.header, header.getContext())}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows?.length ? (
                      table.getRowModel().rows.map(row => (
                        <React.Fragment key={row.id}>
                          <TableRow
                            data-state={row.getIsSelected() && 'selected'}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={row.getToggleExpandedHandler()}
                          >
                            {row.getVisibleCells().map(cell => (
                              <TableCell key={cell.id}>
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </TableCell>
                            ))}
                          </TableRow>
                          {row.getIsExpanded() && (
                            <TableRow>
                              <TableCell colSpan={columns.length} className="p-0">
                                <div className="p-4 bg-muted/30 border-t grid grid-cols-[120px_1fr] gap-6">
                                  <div className="flex flex-col items-center gap-2">
                                    <Avatar className="h-24 w-24 rounded-lg">
                                      <AvatarImage
                                        src={row.original.module.image_url || undefined}
                                        alt={row.original.module.name}
                                      />
                                      <AvatarFallback className="rounded-lg text-2xl">
                                        {row.original.module.name.charAt(0).toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                  </div>
                                  <div className="flex flex-col gap-4">
                                    <div>
                                      <h4 className="text-xl font-bold">
                                        {row.original.module.name}
                                      </h4>
                                      <p className="text-muted-foreground mt-1">
                                        {row.original.module.description ||
                                          'No description provided.'}
                                      </p>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                      {isAdmin && (
                                        <>
                                          <div className="flex flex-col gap-1">
                                            <span className="font-medium text-muted-foreground">
                                              Client ID
                                            </span>
                                            <Code copy>{row.original.module.client_id}</Code>
                                          </div>

                                          <div className="flex flex-col gap-1">
                                            <span className="font-medium text-muted-foreground">
                                              Allowed URLs
                                            </span>
                                            <div className="flex flex-col gap-1">
                                              {row.original.module.urls &&
                                              row.original.module.urls.length > 0 ? (
                                                row.original.module.urls.map((url, i) => (
                                                  <Code key={i} copy>
                                                    {url}
                                                  </Code>
                                                ))
                                              ) : (
                                                <span>-</span>
                                              )}
                                            </div>
                                          </div>
                                        </>
                                      )}

                                      <div className="flex flex-col gap-1">
                                        <span className="font-medium text-muted-foreground">
                                          Module Created By
                                        </span>
                                        <span>{row.original.module.created_by || '-'}</span>
                                      </div>

                                      <div className="flex flex-col gap-1">
                                        <span className="font-medium text-muted-foreground">
                                          Status
                                        </span>
                                        <div className="flex gap-2">
                                          <Badge
                                            variant={
                                              row.original.module.is_active
                                                ? 'default'
                                                : 'secondary'
                                            }
                                          >
                                            {row.original.module.is_active ? 'Active' : 'Inactive'}
                                          </Badge>
                                          {row.original.module.is_banned && (
                                            <Badge variant="destructive">Banned</Badge>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={columns.length} className="h-24 text-center">
                          No results.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {modulesData?.meta && (
              <ListPagination
                page={modulesData.meta.page}
                totalPages={modulesData.meta.total_pages}
                onPageChange={page => setParams({ page })}
              />
            )}
          </div>
        </div>

        {isAdmin && (
          <ServerActionDialogs
            editingServer={editingServer}
            activateDialog={activateDialog}
            deactivateDialog={deactivateDialog}
            generateSecretDialog={generateSecretDialog}
            onEditClose={() => setEditingServer(null)}
            onActivateClose={() => setActivateDialog({ open: false, server: null })}
            onDeactivateClose={() => setDeactivateDialog({ open: false, server: null })}
            onGenerateSecretClose={() => setGenerateSecretDialog({ open: false, server: null })}
            onActivateConfirm={serverId => {
              activateServer(serverId);
              setActivateDialog({ open: false, server: null });
            }}
            onDeactivateConfirm={serverId => {
              deactivateServer(serverId);
              setDeactivateDialog({ open: false, server: null });
            }}
            onGenerateSecretConfirm={serverId => {
              generateSecret(serverId);
              setGenerateSecretDialog({ open: false, server: null });
            }}
            onEditSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ['server', serverId] });
              queryClient.invalidateQueries({ queryKey: ['servers'] });
            }}
          />
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}
