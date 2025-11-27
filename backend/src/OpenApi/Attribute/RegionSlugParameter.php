<?php

declare(strict_types=1);

namespace App\OpenApi\Attribute;

use App\ArgumentResolver\OfficeValueResolver;
use Attribute;
use OpenApi\Attributes as OA;

#[Attribute(Attribute::TARGET_METHOD | Attribute::IS_REPEATABLE)]
class RegionSlugParameter extends OA\Parameter
{
    public function __construct(
        string $name = OfficeValueResolver::ATTRIBUTE_REGION,
        string $description = 'Region slug.',
    ) {
        parent::__construct(
            name: $name,
            description: $description,
            in: 'path',
            required: true,
            schema: new OA\Schema(type: 'string', pattern: '[a-z0-9-]+', example: 'so-00'),
        );
    }
}
