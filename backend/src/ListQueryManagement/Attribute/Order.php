<?php

declare(strict_types=1);

namespace App\ListQueryManagement\Attribute;

use Attribute;

#[Attribute(Attribute::TARGET_CLASS | Attribute::IS_REPEATABLE)]
class Order
{
    /**
     * @param string|callable $property
     * @param string[]|null   $roles
     */
    public function __construct(
        public string $name,
        public mixed $property,
        public ?array $roles = null,
    ) {
    }
}
