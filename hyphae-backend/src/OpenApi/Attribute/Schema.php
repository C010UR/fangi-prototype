<?php

declare(strict_types=1);

namespace App\OpenApi\Attribute;

use Attribute;

#[Attribute(Attribute::TARGET_CLASS | Attribute::IS_REPEATABLE)]
class Schema
{
    public function __construct(
        private ?string $schema = null,
        private ?string $action = null,
        private bool $hasFiles = false,
    ) {
    }

    public function getSchema(): ?string
    {
        return $this->schema;
    }

    public function getAction(): ?string
    {
        return $this->action;
    }

    public function hasFiles(): bool
    {
        return $this->hasFiles;
    }
}
