<?php

declare(strict_types=1);

namespace App\OpenApi\Attribute;

use Attribute;
use OpenApi\Attributes as OA;

#[Attribute(Attribute::TARGET_METHOD | Attribute::IS_REPEATABLE)]
class SuccessResponse extends OA\Response
{
    public function __construct(
        ?string $message = null,
        int|string $response = 200,
        string $description = 'Successful operation.',
        ?string $ref = null,
    ) {
        parent::__construct(
            response: $response,
            description: $description,
            content: $ref ?? new OA\JsonContent(type: 'object', properties: [
                new OA\Property(
                    property: 'error',
                    type: 'boolean',
                    description: 'Whether response is an error.',
                    example: false,
                ),
                new OA\Property(
                    property: 'status_code',
                    type: 'int32',
                    description: 'Error status code (duplicate of HTTP status code).',
                    example: $response,
                ),
                new OA\Property(
                    property: 'message',
                    type: 'boolean',
                    description: 'Message',
                    example: $message ?? 'Operation successful.',
                ),
            ]),
        );
    }
}
