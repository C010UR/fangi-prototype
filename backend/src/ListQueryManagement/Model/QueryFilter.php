<?php

declare(strict_types=1);

namespace App\ListQueryManagement\Model;

use App\ListQueryManagement\Attribute as LqmA;
use JsonSerializable;

class QueryFilter implements JsonSerializable
{
    public array|string|null $value;

    /**
     * @param string|callable $column
     */
    public function __construct(
        public string $alias,
        public mixed $column,
        public LqmA\FilterOperator $operator,
        ?string $value,
    ) {
        $this->value = $this->parseValue($operator, $value);
    }

    private function parseValue(LqmA\FilterOperator $operator, ?string $value): string|array|null
    {
        switch ($operator) {
            case LqmA\FilterOperator::In:
            case LqmA\FilterOperator::NotIn:
                return explode(',', (string)$value);
            case LqmA\FilterOperator::IsNull:
            case LqmA\FilterOperator::IsNotNull:
            case LqmA\FilterOperator::True:
            case LqmA\FilterOperator::False:
                return null;
            default:
                return (string)$value;
        }
    }

    public function prepareValueForQuery(LqmA\FilterOperator $operator, ?string $value): string|bool|array|null
    {
        switch ($operator) {
            case LqmA\FilterOperator::Like:
                return '%' . strtolower($value) . '%';
            case LqmA\FilterOperator::True:
                return true;
            case LqmA\FilterOperator::False:
                return false;
            default:
                return $value;
        }
    }

    public function jsonSerialize(): mixed
    {
        return [
            'field' => $this->alias,
            'operator' => $this->operator->value,
            'value' => $this->value,
        ];
    }
}
