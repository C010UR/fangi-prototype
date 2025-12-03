import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { toast } from 'sonner';

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Code } from '@/components/ui/code';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { ListPagination } from '@/components/ui/list-pagination';
import { Spinner } from '@/components/ui/spinner';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';

import { useLocalList } from '@/hooks/use-local-list';
import { useDebouncedCallback } from '@/hooks/use-debounced-callback';
import { ApiRoutes } from '@/lib/api';
import { fangiFetch } from '@/lib/api/fetch';
import type { Module } from '@/types';

interface ServerModuleFormProps {
  serverId: string;
  onSuccess?: () => void;
}

export function ServerModuleForm({ serverId, onSuccess }: ServerModuleFormProps) {
  const [moduleToAdd, setModuleToAdd] = React.useState<Module | null>(null);
  const queryClient = useQueryClient();

  const {
    data: modulesData,
    setSearch,
    setPage,
    setOrders,
    meta,
    isLoading,
    refresh,
  } = useLocalList<Module>({
    route: ApiRoutes.SERVER_MODULES.CAN_ADD_LIST(serverId),
    queryKey: ['server-modules-can-add', serverId],
  });

  const { mutate: addModule, isPending: isAdding } = useMutation({
    mutationFn: async (moduleId: number) => {
      return fangiFetch({
        route: ApiRoutes.SERVER_MODULES.ADD(serverId),
        method: 'POST',
        body: { module: moduleId },
        useCredentials: true,
      });
    },
    onSuccess: () => {
      toast.success('Module added successfully');
      queryClient.invalidateQueries({ queryKey: ['server-modules', serverId] });
      setModuleToAdd(null);
      refresh();
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to add module');
      setModuleToAdd(null);
    },
  });

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  const onSearch = useDebouncedCallback((value: string) => {
    setSearch(value);
  }, 500);

  const sorting = React.useMemo<SortingState>(() => {
    return (meta.orders || []).map(o => ({
      id: o.field,
      desc: o.order === 'desc',
    }));
  }, [meta.orders]);

  const columns = React.useMemo<ColumnDef<Module>[]>(
    () => [
      {
        accessorKey: 'image_url',
        header: 'Image',
        size: 60,
        cell: ({ row }) => {
          const name = row.original.name;
          const src = row.original.image_url;
          return (
            <Avatar className="h-8 w-8">
              <AvatarImage src={src || undefined} alt={name} />
              <AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
          );
        },
      },
      {
        accessorKey: 'name',
        header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
      },
      {
        accessorKey: 'urls',
        header: 'Allowed URLs',
        size: 250,
        cell: ({ row }) => {
          const urls = row.original.urls || [];
          const maxVisible = 1;

          if (urls.length === 0) {
            return (
              <div className="text-muted-foreground">
                <Code>-</Code>
              </div>
            );
          }

          if (urls.length <= maxVisible) {
            return (
              <div className="truncate">
                {urls.map(url => (
                  <Code copy key={url}>
                    {url}
                  </Code>
                ))}
              </div>
            );
          }

          return (
            <div>
              <HoverCard>
                <HoverCardTrigger asChild onClick={e => e.stopPropagation()}>
                  <div>
                    {urls.slice(0, maxVisible).map(url => (
                      <Code copy key={url}>
                        {url}
                      </Code>
                    ))}
                    <span className="text-muted-foreground ml-1">+ {urls.length - maxVisible}</span>
                  </div>
                </HoverCardTrigger>
                <HoverCardContent align="start">
                  <div className="flex flex-col gap-2">
                    <h4 className="font-medium leading-none">Allowed URLs</h4>
                    <div className="text-sm text-muted-foreground">
                      <ul className="space-y-1">
                        {urls.map((url, i) => (
                          <li key={i} className="break-all">
                            <Code copy>{url}</Code>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>
            </div>
          );
        },
      },
      {
        accessorKey: 'description',
        header: 'Description',
        size: 500,
        cell: ({ row }) => (
          <div className="truncate max-w-[500px]" title={row.original.description || ''}>
            {row.original.description || '-'}
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: modulesData?.data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    manualPagination: true,
    state: {
      sorting,
    },
    onSortingChange: updater => {
      const newSorting = typeof updater === 'function' ? updater(sorting) : updater;
      setOrders(
        newSorting.map(s => ({
          field: s.id,
          order: s.desc ? 'desc' : 'asc',
        }))
      );
    },
  });

  return (
    <>
      <div className="flex flex-col gap-4 flex-1 overflow-hidden min-h-0 p-1 h-full">
        <div className="flex justify-between items-center">
          <Input
            placeholder="Search modules..."
            onChange={e => onSearch(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <div className="rounded-md border overflow-hidden flex-1 min-h-0 relative flex flex-col">
          <div className="overflow-auto flex-1">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
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
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      <Spinner />
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map(row => (
                    <TableRow
                      key={row.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => !isAdding && setModuleToAdd(row.original)}
                      data-state={isAdding ? 'disabled' : undefined}
                    >
                      {row.getVisibleCells().map(cell => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      No modules found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {modulesData?.meta && (
          <div className="flex-none">
            <ListPagination
              page={modulesData.meta.page}
              totalPages={modulesData.meta.total_pages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      <AlertDialog open={!!moduleToAdd} onOpenChange={open => !open && setModuleToAdd(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Add Module</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to add <strong>{moduleToAdd?.name}</strong> to this server?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isAdding}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isAdding}
              onClick={e => {
                e.preventDefault();
                if (moduleToAdd) {
                  addModule(moduleToAdd.id);
                }
              }}
            >
              {isAdding ? 'Adding...' : 'Add Module'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
