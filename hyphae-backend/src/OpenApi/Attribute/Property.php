<?php

declare(strict_types=1);

namespace App\OpenApi\Attribute;

use Attribute;
use OpenApi\Attributes as OA;
use OpenApi\Generator;

#[Attribute(Attribute::TARGET_PROPERTY)]
class Property extends OA\Schema
{
    public function __construct(
        public ?string $property = null,
        // schema
        string|object|null $ref = null,
        ?string $schema = null,
        ?string $title = null,
        ?string $description = null,
        ?int $maxProperties = null,
        ?int $minProperties = null,
        ?array $required = null,
        ?array $properties = null,
        string|array|null $type = null,
        ?string $format = null,
        ?OA\Items $items = null,
        ?string $collectionFormat = null,
        mixed $default = Generator::UNDEFINED,
        $maximum = null,
        bool|int|float|null $exclusiveMaximum = null,
        $minimum = null,
        bool|int|float|null $exclusiveMinimum = null,
        ?int $maxLength = null,
        ?int $minLength = null,
        ?int $maxItems = null,
        ?int $minItems = null,
        ?bool $uniqueItems = null,
        ?string $pattern = null,
        array|string|null $enum = null,
        ?OA\Discriminator $discriminator = null,
        ?bool $readOnly = null,
        ?bool $writeOnly = null,
        ?OA\Xml $xml = null,
        ?OA\ExternalDocumentation $externalDocs = null,
        mixed $example = Generator::UNDEFINED,
        ?array $examples = null,
        ?bool $nullable = null,
        ?bool $deprecated = null,
        ?array $allOf = null,
        ?array $anyOf = null,
        ?array $oneOf = null,
        OA\AdditionalProperties|bool|null $additionalProperties = null,
        mixed $const = Generator::UNDEFINED,
        // annotation
        ?array $x = null,
        ?array $attachables = null,
    ) {
        parent::__construct(
            ref: $ref,
            schema: $schema,
            title: $title,
            description: $description,
            maxProperties: $maxProperties,
            minProperties: $minProperties,
            required: $required,
            properties: $properties,
            type: $type,
            format: $format,
            collectionFormat: $collectionFormat,
            default: $default,
            maximum: $maximum,
            exclusiveMaximum: $exclusiveMaximum,
            minimum: $minimum,
            exclusiveMinimum: $exclusiveMinimum,
            maxLength: $maxLength,
            minLength: $minLength,
            maxItems: $maxItems,
            minItems: $minItems,
            uniqueItems: $uniqueItems,
            pattern: $pattern,
            enum: $enum,
            readOnly: $readOnly,
            writeOnly: $writeOnly,
            xml: $xml,
            example: $example,
            nullable: $nullable,
            deprecated: $deprecated,
            allOf: $allOf,
            anyOf: $anyOf,
            oneOf: $oneOf,
            additionalProperties: $additionalProperties,
            const: $const,
            x: $x,
            attachables: $attachables,
            items: $items,
            discriminator: $discriminator,
            externalDocs: $externalDocs,
            examples: $examples,
        );
    }
}
