<?php

declare(strict_types=1);

namespace App\OpenApi\Attribute;

use Attribute;
use OpenApi\Attributes as OA;
use OpenApi\Generator;

#[Attribute(Attribute::TARGET_METHOD | Attribute::IS_REPEATABLE)]
class JsonResponse extends OA\Response
{
    public function __construct(
        int $response,
        string $description,
        object|string|null $schema = null,
        ?string $type = null,
        ?array $properties = null,
        ?OA\Items $items = null,
        ?int $minItems = null,
        ?int $maxItems = null,
        mixed $example = Generator::UNDEFINED,
        ?array $examples = null,
        ?array $headers = null,
        ?array $links = null,
        ?array $x = null,
        ?array $attachables = null,
    ) {
        $jsonContent = new OA\JsonContent(
            ref: $schema,
            type: $type,
            properties: $properties,
            items: $items,
            minItems: $minItems,
            maxItems: $maxItems,
            example: $example,
            examples: $examples,
        );

        parent::__construct(
            response: $response,
            description: $description,
            content: $jsonContent,
            headers: $headers,
            links: $links,
            x: $x,
            attachables: $attachables,
        );
    }
}
