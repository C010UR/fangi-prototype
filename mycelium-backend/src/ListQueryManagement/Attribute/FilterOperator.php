<?php

declare(strict_types=1);

namespace App\ListQueryManagement\Attribute;

enum FilterOperator: string
{
    case Equal = 'eq';
    case NotEqual = 'ne';
    case GreaterThan = 'gt';
    case GreaterThanOrEqual = 'gte';
    case LessThan = 'lt';
    case LessThanOrEqual = 'lte';
    case Like = 'like';
    case In = 'in';
    case NotIn = 'nin';
    case IsNull = 'null';
    case IsNotNull = 'notnull';
    case True = 'true';
    case False = 'false';

    public static function hasArgument(FilterOperator $operator): bool
    {
        $operators = [
            FilterOperator::IsNull,
            FilterOperator::IsNotNull,
            FilterOperator::True,
            FilterOperator::False,
        ];

        return !\in_array($operator, $operators, true);
    }
}
