<?php

declare(strict_types=1);

namespace App\ListQueryManagement\Model;

use App\ListQueryManagement\Attribute as LqmA;
use Closure;

class QueryFilterOperator
{
    public function __construct(
        public LqmA\FilterOperator $operator,
        public ?Closure $processor = null,
    ) {
    }
}
