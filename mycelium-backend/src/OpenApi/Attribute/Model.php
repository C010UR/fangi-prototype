<?php

declare(strict_types=1);

namespace App\OpenApi\Attribute;

use Attribute;

#[Attribute(Attribute::TARGET_METHOD | Attribute::IS_REPEATABLE)]
class Model
{
    public function __construct(
        private string $className,
        private ?string $group = null,
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
}
