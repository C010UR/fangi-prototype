import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { ListResult } from '@/types';
import { useLocalListParams } from '@/hooks/use-local-list-params';
import { fangiFetch } from '@/lib/api/fetch';
import { listMetaToSearchParams } from '@/lib/query-params';

interface UseLocalListOptions {
  route: string;
  queryKey: string[];
  useCredentials?: boolean;
}

export function useLocalList<T>({ route, queryKey, useCredentials = true }: UseLocalListOptions) {
  const queryClient = useQueryClient();
  const { meta, setParams, setPage, setSearch, setOrders } = useLocalListParams();

  const fetchList = async (): Promise<ListResult<T>> => {
    const params = listMetaToSearchParams(meta, true);

    return fangiFetch<ListResult<T>>({
      route,
      params,
      useCredentials,
    });
  };

  const query = useQuery({
    queryKey: [...queryKey, meta],
    queryFn: fetchList,
    placeholderData: previousData => previousData,
  });

  return {
    ...query,
    meta,
    setParams,
    setPage,
    setSearch,
    setOrders,
    refresh: () => queryClient.invalidateQueries({ queryKey }),
  };
}
