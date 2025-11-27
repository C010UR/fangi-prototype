<?php

declare(strict_types=1);

namespace App\ListQueryManagement;

use App\ListQueryManagement\Attribute as LqmA;
use App\ListQueryManagement\Attribute\Filter;
use App\ListQueryManagement\Attribute\Order;
use App\ListQueryManagement\Model\QueryFilter;
use App\ListQueryManagement\Model\QueryOrder;

class LqmQueryExtractor
{
    /**
     * @param Filter[] $supportedFilters
     *
     * @return QueryFilter[]
     */
    public function extractFilters(mixed $query, array $supportedFilters): array
    {
        if (\is_string($query)) {
            $query = [$query];
        } elseif (!\is_array($query)) {
            return [];
        }

        $filterMap = [];

        foreach ($supportedFilters as $filter) {
            $filterMap[$filter->name] = $filter;
        }

        $filters = [];
        $addedFilters = [];

        foreach ($query as $queryItem) {
            if (empty($queryItem) || !\is_string($queryItem)) {
                continue;
            }

            $filterParts = explode(':', $queryItem);

            if (3 !== \count($filterParts) && 2 !== \count($filterParts)) {
                continue;
            }

            $hasArgument = 3 === \count($filterParts);

            if ($hasArgument) {
                [$column, $operatorStr, $value] = $filterParts;
            } else {
                [$column, $operatorStr] = $filterParts;
                $value = null;
            }

            $operator = LqmA\FilterOperator::tryFrom($operatorStr);

            if (
                empty($column)
                || !\array_key_exists($column, $filterMap)
                || null === $operator
                || !\array_key_exists($operator->value, $filterMap[$column]->operators)
                || ($hasArgument && !LqmA\FilterOperator::hasArgument($operator))
                || (!$hasArgument && LqmA\FilterOperator::hasArgument($operator))
            ) {
                continue;
            }

            if (
                $hasArgument
                && null !== $filterMap[$column]->allowedValues
                && !\in_array($value, $filterMap[$column]->allowedValues, true)
            ) {
                continue;
            }

            $addedFilters[$column] = $column;
            $filters[] = new QueryFilter(
                $column,
                $filterMap[$column]->property,
                $operator,
                $value,
            );
        }

        foreach ($supportedFilters as $filter) {
            if (!\array_key_exists($filter->name, $addedFilters) && null !== $filter->defaultValue) {
                $filters[] = new QueryFilter(
                    $filter->name,
                    $filter->property,
                    $filter->defaultValueOperator ?? LqmA\FilterOperator::Equal,
                    $filter->defaultValue,
                );
            }
        }

        return $filters;
    }

    /**
     * @param Order[] $supportedOrders
     *
     * @return QueryOrder[]
     */
    public function extractOrders(mixed $query, array $supportedOrders): array
    {
        if (\is_string($query)) {
            $query = [$query];
        } elseif (!\is_array($query)) {
            return [];
        }

        $orderMap = [];

        foreach ($supportedOrders as $order) {
            $orderMap[$order->name] = $order;
        }

        $orders = [];

        foreach ($query as $rawOrder) {
            if (empty($rawOrder) || !\is_string($rawOrder)) {
                continue;
            }

            $isDescending = str_starts_with($rawOrder, '-');
            $column = $isDescending ? substr($rawOrder, 1) : $rawOrder;

            if (empty($column) || !\array_key_exists($column, $orderMap)) {
                continue;
            }

            $orders[] = new QueryOrder(
                $column,
                $orderMap[$column]->property,
                $isDescending ? 'desc' : 'asc',
            );
        }

        return $orders;
    }

    public function extractSearch(mixed $search): ?string
    {
        if (null === $search || '' === $search) {
            return null;
        }

        if (
            \is_string($search)
            || \is_scalar($search)
            || (\is_object($search) && method_exists($search, '__toString'))
        ) {
            return preg_replace('/\s+/', ' ', strtolower(trim($search))) ?: null;
        }

        return null;
    }

    public function extractPage(mixed $page): ?int
    {
        if (\is_int($page)) {
            return max(1, $page);
        }

        if (\is_string($page)) {
            $validatedPage = filter_var($page, \FILTER_VALIDATE_INT, \FILTER_NULL_ON_FAILURE);

            return null !== $validatedPage ? max(1, $validatedPage) : null;
        }

        return null;
    }

    public function extractPageSize(mixed $pageSize): ?int
    {
        if (\is_int($pageSize)) {
            return max(0, $pageSize);
        }

        if (\is_string($pageSize)) {
            $validatedPageSize = filter_var($pageSize, \FILTER_VALIDATE_INT, \FILTER_NULL_ON_FAILURE);

            return null !== $validatedPageSize ? max(0, $validatedPageSize) : null;
        }

        return null;
    }
}
