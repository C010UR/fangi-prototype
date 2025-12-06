<?php

declare(strict_types=1);

namespace App\ListQueryManagement\Attribute;

use Attribute;

#[Attribute(Attribute::TARGET_CLASS)]
class Search
{
    /**
     * @param SearchParam[] $searchParams
     * @param string[]|null $roles
     */
    public function __construct(
        public array $searchParams,
        public ?array $roles = null,
    ) {
    }
}
