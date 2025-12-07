import { z } from 'zod';
import type { Filter, FilterOperator, ListMeta, Order, OrderDirection } from '../types';

export type ListParams = Pick<ListMeta, 'page' | 'page_size' | 'search' | 'filters' | 'orders'>;

export const listParamsSchema = z
  .object({
    page: z.number().optional().catch(1),
    page_size: z.number().optional().catch(0),
    q: z.string().optional(),
    filter: z.union([z.string(), z.array(z.string())]).optional(),
    sort: z.union([z.string(), z.array(z.string())]).optional(),
  })
  .transform(data => {
    const params = new URLSearchParams();

    if (data.page) params.set('page', data.page.toString());
    if (data.page_size) params.set('page_size', data.page_size.toString());
    if (data.q) params.set('q', data.q);

    if (data.filter) {
      const filters = Array.isArray(data.filter) ? data.filter : [data.filter];
      filters.forEach(f => params.append('filter[]', f));
    }

    if (data.sort) {
      const sorts = Array.isArray(data.sort) ? data.sort : [data.sort];
      sorts.forEach(s => params.append('sort[]', s));
    }

    return parseListParams(params);
  });

export function parseListParams(searchParams: URLSearchParams): ListParams {
  const page = parseInt(searchParams.get('page') || '1', 10);
  const page_size = parseInt(searchParams.get('page_size') || '0', 10);
  const search = searchParams.get('q') || '';

  const filters: Filter[] = [];
  const filterParams = [...searchParams.getAll('filter[]'), ...searchParams.getAll('filter')];

  filterParams.forEach(param => {
    const params = Array.isArray(param) ? param : [param];
    params.forEach(p => {
      const firstColonIndex = p.indexOf(':');
      if (firstColonIndex === -1) return;

      const field = p.substring(0, firstColonIndex);
      const rest = p.substring(firstColonIndex + 1);

      const secondColonIndex = rest.indexOf(':');

      let operator: string;
      let value: string | null = null;

      if (secondColonIndex === -1) {
        operator = rest;
      } else {
        operator = rest.substring(0, secondColonIndex);
        value = rest.substring(secondColonIndex + 1);
      }

      if (isValidOperator(operator)) {
        let finalValue: string | string[] | null = value;
        if ((operator === 'in' || operator === 'nin') && typeof value === 'string') {
          finalValue = value.split(',');
        }

        filters.push({
          field,
          operator: operator as FilterOperator,
          value: finalValue,
        });
      }
    });
  });

  const orders: Order[] = [];
  const sortParams = [...searchParams.getAll('sort[]'), ...searchParams.getAll('sort')];

  sortParams.forEach(param => {
    const params = Array.isArray(param) ? param : [param];
    params.forEach(p => {
      let field = p;
      let order: OrderDirection = 'asc';

      if (p.startsWith('-')) {
        field = p.substring(1);
        order = 'desc';
      }

      if (field) {
        orders.push({ field, order });
      }
    });
  });

  return {
    page: isNaN(page) ? 1 : page,
    page_size: isNaN(page_size) ? 0 : page_size,
    search,
    filters,
    orders,
  };
}

export function listMetaToSearchParams(meta: ListParams, useBrackets = true): URLSearchParams {
  const params = new URLSearchParams();

  if (meta.search) {
    params.set('q', meta.search);
  }

  if (meta.page && meta.page > 1) {
    params.set('page', meta.page.toString());
  }

  if (meta.page_size !== undefined && meta.page_size !== 0) {
    params.set('page_size', meta.page_size.toString());
  }

  meta.filters.forEach(filter => {
    let filterString = `${filter.field}:${filter.operator}`;
    if (filter.value !== null && filter.value !== undefined) {
      const val = Array.isArray(filter.value) ? filter.value.join(',') : filter.value;
      filterString += `:${val}`;
    }
    params.append(useBrackets ? 'filter[]' : 'filter', filterString);
  });

  meta.orders.forEach(order => {
    const prefix = order.order === 'desc' ? '-' : '';
    params.append(useBrackets ? 'sort[]' : 'sort', `${prefix}${order.field}`);
  });

  return params;
}

function isValidOperator(op: string): boolean {
  const operators: FilterOperator[] = [
    'eq',
    'ne',
    'gt',
    'gte',
    'lt',
    'lte',
    'like',
    'in',
    'nin',
    'null',
    'notnull',
    'true',
    'false',
  ];
  return operators.includes(op as FilterOperator);
}
