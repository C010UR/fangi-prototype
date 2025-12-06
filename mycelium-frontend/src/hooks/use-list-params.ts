import { useLocation, useNavigate } from '@tanstack/react-router';
import { useCallback, useMemo } from 'react';
import { listMetaToSearchParams, parseListParams, type ListParams } from '../lib/query-params';
import type { Filter, Order } from '../types';

export function useListParams() {
  const location = useLocation();
  const navigate = useNavigate();

  const meta = useMemo(() => {
    const searchStr = location.searchStr ?? location.href.split('?')[1] ?? '';
    const searchParams = new URLSearchParams(searchStr);
    return parseListParams(searchParams);
  }, [location.searchStr, location.href]);

  const updateParams = useCallback(
    (newMeta: Partial<ListParams>) => {
      const mergedMeta = { ...meta, ...newMeta };
      const searchParams = listMetaToSearchParams(mergedMeta, false);

      const search: Record<string, unknown> = {};

      searchParams.forEach((value, key) => {
        let finalValue: string | number = value;
        if (key === 'page' || key === 'page_size') {
          finalValue = parseInt(value, 10);
        }

        if (key in search) {
          const existing = search[key];
          if (Array.isArray(existing)) {
            existing.push(finalValue);
          } else {
            search[key] = [existing, finalValue];
          }
        } else {
          search[key] = finalValue;
        }
      });

      navigate({
        // @ts-expect-error - We're using a generic search object here which is valid but untyped in this generic hook context
        search: () => search,
        replace: true,
      });
    },
    [meta, navigate]
  );

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
