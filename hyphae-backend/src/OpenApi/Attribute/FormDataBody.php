<?php

declare(strict_types=1);

namespace App\OpenApi\Attribute;

use Attribute;
use InvalidArgumentException;
use OpenApi\Attributes as OA;
use OpenApi\Generator;

#[Attribute(Attribute::TARGET_METHOD)]
class FormDataBody extends OA\RequestBody
{
    public function __construct(
        string $description,
        object|string|null $schema = null,
        ?array $properties = null,
        bool $required = true,
        mixed $example = Generator::UNDEFINED,
        ?array $examples = null,
        ?array $x = null,
        ?array $attachables = null,
    ) {
        if ($schema) {
            $formDataContent = new OA\MediaType(
                mediaType: 'multipart/form-data',
                schema: new OA\Schema(ref: $schema),
            );
        } elseif ($properties) {
            $formDataContent = new OA\MediaType(
                mediaType: 'multipart/form-data',
                schema: new OA\Schema(
                    type: 'object',
                    properties: $properties,
                    example: $example,
                    examples: $examples,
                ),
            );
        } else {
            throw new InvalidArgumentException('At least one must be provided: schema, properties');
        }

        parent::__construct(
            description: $description,
            required: $required,
            content: $formDataContent,
            x: $x,
            attachables: $attachables,
        );
    }
}
