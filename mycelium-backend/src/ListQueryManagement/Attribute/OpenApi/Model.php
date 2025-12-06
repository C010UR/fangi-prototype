<?php

declare(strict_types=1);

namespace App\ListQueryManagement\Attribute\OpenApi;

use Attribute;

#[Attribute(Attribute::TARGET_METHOD | Attribute::IS_REPEATABLE)]
class Model
{
    public function __construct(
        private string $className,
        private ?string $group = null,
        private bool $isList = false,
    ) {
    }

    public function getClassName(): string
    {
        return $this->className;
    }

    public function getGroup(): ?string
    {
        return $this->group;
    }

    public function isList(): bool
    {
        return $this->isList;
    }
}
