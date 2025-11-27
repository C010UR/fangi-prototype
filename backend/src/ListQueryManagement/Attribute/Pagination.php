<?php

declare(strict_types=1);

namespace App\ListQueryManagement\Attribute;

use Attribute;

#[Attribute(Attribute::TARGET_CLASS)]
class Pagination
{
    /**
     * @param string[]|null $roles
     */
    public function __construct(
        public ?array $roles = null,
    ) {
    }
}
