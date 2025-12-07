import { useCallback, useState } from 'react';
import type { ListParams } from '../lib/query-params';
import type { Filter, Order } from '../types';

export function useLocalListParams(initialParams?: Partial<ListParams>) {
  const [meta, setMeta] = useState<ListParams>({
    page: 1,
    page_size: 10,
    search: '',
    filters: [],
    orders: [],
    ...initialParams,
  });

  const updateParams = useCallback((newMeta: Partial<ListParams>) => {
    setMeta(prev => ({ ...prev, ...newMeta }));
  }, []);

  const setPage = useCallback(
    (page: number) => {
      updateParams({ page });
    },
    [updateParams]
  );

  const setPageSize = useCallback(
    (page_size: number) => {
      updateParams({ page_size, page: 1 });
    },
    [updateParams]
  );

  const setSearch = useCallback(
    (search: string) => {
      updateParams({ search, page: 1 });
    },
    [updateParams]
  );

  const setFilters = useCallback(
    (filters: Filter[]) => {
      updateParams({ filters, page: 1 });
    },
    [updateParams]
  );

  const setOrders = useCallback(
    (orders: Order[]) => {
      updateParams({ orders });
    },
    [updateParams]
  );

  return {
    meta,
    setPage,
    setPageSize,
    setSearch,
    setFilters,
    setOrders,
    setParams: updateParams,
  };
}
