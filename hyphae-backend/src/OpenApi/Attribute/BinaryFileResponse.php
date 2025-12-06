<?php

declare(strict_types=1);

namespace App\OpenApi\Attribute;

use Attribute;
use OpenApi\Attributes as OA;

#[Attribute(Attribute::TARGET_METHOD | Attribute::IS_REPEATABLE)]
class BinaryFileResponse extends OA\Response
{
    public function __construct(
        int $response,
        string $description,
    ) {
        parent::__construct(
            response: $response,
            description: $description,
            content: new OA\MediaType(
                mediaType: 'application/octet-stream',
                schema: new OA\Schema(type: 'string', format: 'binary'),
            ),
        );
    }
}
