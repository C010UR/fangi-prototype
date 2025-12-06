<?php

declare(strict_types=1);

namespace App\ListQueryManagement\Attribute;

use Attribute;

#[Attribute(Attribute::TARGET_CLASS)]
class Schema
{
    public function __construct(
        public string $schema,
        public ?string $additionalDataSchema = null,
    ) {
    }
}
