<?php

declare(strict_types=1);

namespace App\OpenApi\Attribute;

use Attribute;
use OpenApi\Attributes as OA;

#[Attribute(Attribute::TARGET_METHOD | Attribute::IS_REPEATABLE)]
class ErrorResponse extends OA\Response
{
    public const array DEFAULT_DESCRIPTIONS = [
        400 => 'Bad Request. Request could not be processed or data is invalid.',
        401 => 'Unauthorized. User is not authenticated.',
        403 => 'Access Denied.',
        404 => 'Resource not found.',
        429 => 'Client was rate limited.',
        500 => 'Internal Server Error.',
        '5XX' => 'Internal Server Error.',
        null => 'Undefined Error.',
    ];

    public const array DEFAULT_MESSAGES = [
        400 => 'Request is invalid.',
        401 => 'Full authentication is required to access this resource.',
        403 => 'Access Denied.',
        404 => 'Resource not found.',
        429 => 'Too many requests. You can make a new request in 48 seconds.',
        500 => 'Internal Server Error has occurred.',
        '5XX' => 'Internal Server Error',
        null => 'Undefined Error has occurred.',
    ];

    public function __construct(
        int|string $response,
        ?string $description = null,
        ?string $message = null,
        ?string $ref = null,
    ) {
        $description ??= static::DEFAULT_DESCRIPTIONS[$response] ?? static::DEFAULT_DESCRIPTIONS[null];
        $message ??= static::DEFAULT_MESSAGES[$response] ?? $description;

        $responseNumber = match ($response) {
            '5XX' => 500,
            null => 500,
            default => $response,
        };

        parent::__construct(
            response: $response,
            description: $description,
            content: $ref ?? new OA\JsonContent(type: 'object', properties: [
                new OA\Property(
                    property: 'error',
                    type: 'boolean',
                    description: 'Whether response is an error.',
                    example: true,
                ),
                new OA\Property(
                    property: 'status_code',
                    type: 'int32',
                    description: 'Error status code (duplicate of HTTP status code).',
                    example: $responseNumber,
                ),
                new OA\Property(
                    property: 'error_description',
                    type: 'string',
                    description: 'Description of the error.',
                    example: $message ?? $description,
                ),
            ]),
        );
    }
}
