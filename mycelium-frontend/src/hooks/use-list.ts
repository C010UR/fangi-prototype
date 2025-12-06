import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { ListResult } from '@/types';
import { useListParams } from '@/hooks/use-list-params';
import { fangiFetch } from '@/lib/api/fetch';
import { listMetaToSearchParams } from '@/lib/query-params';

interface UseListOptions {
  route: string;
  queryKey: string[];
  useCredentials?: boolean;
}

export function useList<T>({ route, queryKey, useCredentials = true }: UseListOptions) {
  const queryClient = useQueryClient();
  const { meta, setParams } = useListParams();

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
    refresh: () => queryClient.invalidateQueries({ queryKey }),
  };
}
