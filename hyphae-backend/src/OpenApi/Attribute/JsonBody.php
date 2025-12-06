<?php

declare(strict_types=1);

namespace App\OpenApi\Attribute;

use Attribute;
use InvalidArgumentException;
use OpenApi\Attributes as OA;
use OpenApi\Generator;

#[Attribute(Attribute::TARGET_METHOD)]
class JsonBody extends OA\RequestBody
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
            $jsonContent = new OA\JsonContent(
                ref: $schema,
                example: $example,
                examples: $examples,
            );
        } elseif ($properties) {
            $jsonContent = new OA\JsonContent(
                type: 'object',
                properties: $properties,
                example: $example,
                examples: $examples,
            );
        } else {
            throw new InvalidArgumentException('At least one must be provided: schema, properties');
        }

        parent::__construct(
            description: $description,
            required: $required,
            content: $jsonContent,
            x: $x,
            attachables: $attachables,
        );
    }
}
