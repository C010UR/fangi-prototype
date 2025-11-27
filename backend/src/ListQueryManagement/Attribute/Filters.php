<?php

declare(strict_types=1);

namespace App\ListQueryManagement\Attribute;

use Attribute;

#[Attribute(Attribute::TARGET_CLASS)]
class Filters
{
    /**
     * @param string[]|null $roles
     * @param Filter[]      $filters
     */
    public function __construct(
        public array $filters,
        public ?array $roles = null,
    ) {
    }
}
