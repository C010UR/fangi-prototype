<?php

declare(strict_types=1);

namespace App\ListQueryManagement\Attribute;

use Attribute;

#[Attribute(Attribute::TARGET_CLASS | Attribute::IS_REPEATABLE)]
class SearchParam
{
    /**
     * @param string[]|null $roles
     */
    public function __construct(
        public string $name,
        public string $property,
        public ?array $roles = null,
        public bool $isString = true,
    ) {
    }
}
