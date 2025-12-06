<?php

declare(strict_types=1);

namespace App\ListQueryManagement\Model;

use JsonSerializable;

class QueryOrder implements JsonSerializable
{
    /**
     * @param string|callable $column
     */
    public function __construct(
        public string $alias,
        public mixed $column,
        public string $order,
    ) {
    }

    public function jsonSerialize(): array
    {
        return [
            'field' => $this->alias,
            'order' => $this->order,
        ];
    }
}
