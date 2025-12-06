<?php

declare(strict_types=1);

namespace App\OpenApi\Attribute;

use Attribute;
use OpenApi\Attributes as OA;

#[Attribute(Attribute::TARGET_METHOD | Attribute::IS_REPEATABLE)]
class DatabaseIdParameter extends OA\Parameter
{
    public function __construct(
        string $name = 'id',
        string $description = 'ID.',
    ) {
        parent::__construct(
            name: $name,
            description: $description,
            in: 'path',
            required: true,
            schema: new OA\Schema(type: 'integer', format: 'int32', minimum: 1),
        );
    }
}
