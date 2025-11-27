<?php

declare(strict_types=1);

namespace App\ListQueryManagement\Attribute;

use Attribute;

#[Attribute(Attribute::TARGET_CLASS)]
class Orders
{
    /**
     * @param Order[]       $orders
     * @param string[]|null $roles
     */
    public function __construct(
        public Order $defaultOrder,
        public array $orders = [],
        public ?array $roles = null,
    ) {
    }
}
