<?php

declare(strict_types=1);

namespace App\ListQueryManagement\Attribute\OpenApi;

use Attribute;

#[Attribute(Attribute::TARGET_METHOD | Attribute::IS_REPEATABLE)]
class ListResponse
{
    public function __construct(
        private string $className,
    ) {
    }

    public function getClassName(): string
    {
        return $this->className;
    }
}
