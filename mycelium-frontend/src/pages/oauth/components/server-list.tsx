import { useState, useRef, useEffect, useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Search, Check } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { type Server, type ListResult } from '@/types';
import { ApiRoutes, fangiFetch } from '@/lib/api';

interface ServerListProps {
  selectedId?: number;
  onSelect: (server: Server) => void;
}

export function ServerList({ selectedId, onSelect }: ServerListProps) {
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
