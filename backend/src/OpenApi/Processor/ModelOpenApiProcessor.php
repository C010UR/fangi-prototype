<?php

declare(strict_types=1);

namespace App\OpenApi\Processor;

use App\OpenApi\Attribute as OAC;
use App\OpenApi\Attribute\Model;
use App\OpenApi\Model\SchemaWrapper;
use DateTimeInterface;
use LogicException;
use OpenApi\Analysis;
use OpenApi\Annotations as OAA;
use OpenApi\Attributes as OA;
use OpenApi\Generator;
use ReflectionAttribute;
use ReflectionClass;
use ReflectionIntersectionType;
use ReflectionProperty;
use ReflectionUnionType;
use Symfony\Component\DependencyInjection\Attribute\AsTaggedItem;
use Symfony\Component\Serializer\Attribute as Serializer;
use Symfony\Component\Validator\Constraints as Assert;

#[AsTaggedItem('nelmio_api_doc.swagger.processor')]
class ModelOpenApiProcessor
{
    public function __invoke(Analysis $analysis)
    {
        foreach ($analysis->getAnnotationsOfType(OAA\Schema::class) ?? [] as $annotation) {
            $this->processSchema($annotation);
        }
    }

    private function processSchema(OAA\Schema $schema): void
    {
        if (!($schema->ref instanceof Model)) {
            return;
        }

        $reflection = new ReflectionClass($schema->ref->getClassName());

        if (empty($reflection->getAttributes(OAC\Schema::class))) {
            return;
        }

        $action = $schema->ref->getGroup();
        $attribute = null;

        foreach ($reflection->getAttributes(OAC\Schema::class) as $attribute) {
            $_attribute = $attribute->newInstance();
            if ($_attribute->getAction() === $action) {
                $attribute = $_attribute;
                break;
            }
        }

        if (null === $attribute) {
            return;
        }

        if (null !== $attribute->getSchema()) {
            $schema->ref = $attribute->getSchema();
        } else {
            $this->processModelThroughReflection(new SchemaWrapper($schema), $schema->ref->getClassName())->unwrap();
        }
    }

    private function processModelThroughReflection(SchemaWrapper $schema, string $className): SchemaWrapper
    {
        $reflection = new ReflectionClass($className);

        $schema->type = 'object';
        $schema->properties = [];
        $schema->ref = Generator::UNDEFINED;

        foreach ($reflection->getProperties() as $property) {
            if (!$property->isPublic()) {
                continue;
            }

            /** @var OAC\Property|null $attribute */
            $attribute = $this->extractAttribute($property, OAC\Property::class);

            if (null === $attribute) {
                continue;
            }

            $attribute = new SchemaWrapper($attribute);

            if (null === $attribute->property || Generator::UNDEFINED === $attribute->property) {
                $attribute = $this->extractPropertyName($property, $attribute);
            }

            if (
                (null === $attribute->type || Generator::UNDEFINED === $attribute->type)
                && (null === $attribute->allOf || Generator::UNDEFINED === $attribute->allOf)
                && (null === $attribute->anyOf || Generator::UNDEFINED === $attribute->anyOf)
                && (null === $attribute->oneOf || Generator::UNDEFINED === $attribute->oneOf)
            ) {
                $attribute = $this->extractPropertyType($property, $attribute);
            }

            if (null === $attribute->nullable || Generator::UNDEFINED === $attribute->nullable) {
                $attribute = $this->extractPropertyNullable($property, $attribute);
            }

            $schema->properties[] = $attribute->unwrap();
        }

        return $schema;
    }

    private function extractPropertyName(ReflectionProperty $property, SchemaWrapper $schema): SchemaWrapper
    {
        /** @var Serializer\SerializedName|null */
        $serializedName = $this->extractAttribute($property, Serializer\SerializedName::class);

        $schema->property = null === $serializedName ? $property->getName() : $serializedName->getSerializedName();

        return $schema;
    }

    private function extractPropertyType(ReflectionProperty $property, SchemaWrapper $schema): SchemaWrapper
    {
        /** @var Assert\Type|null $assertType */
        $assertType = $this->extractAttribute($property, Assert\Type::class);

        if (null !== $assertType) {
            $schema->type = $assertType->type;
        }

        $type = $property->getType();
        $attributes = array_map(fn(ReflectionAttribute $_attribute) => $_attribute->newInstance(), $property->getAttributes());

        if ($type instanceof ReflectionUnionType) {
            $schema->anyOf = [];
            foreach ($type->getTypes() as $nestedType) {
                if ('null' === $nestedType->getName()) {
                    $schema->nullable = true;
                    continue;
                }

                $nestedProperty =  new SchemaWrapper(new OA\Property());

                if ($nestedType instanceof ReflectionIntersectionType) {
                    $nestedProperty->allOf = [];

                    foreach ($nestedType as $nestedNestedType) {
                        $nestedProperty->allOf[] = $this->extractPropertySingleType(
                            (string)$nestedNestedType,
                            $attributes,
                            new SchemaWrapper(new OA\Property()),
                        )->unwrap();
                    }
                } else {
                    $nestedProperty = $this->extractPropertySingleType($nestedType->getName(), $attributes, $nestedProperty);
                }

                $schema->anyOf[] = $nestedProperty->unwrap();
            }
        } elseif ($type instanceof ReflectionIntersectionType) {
            $schema->allOf = [];

            foreach ($type->getTypes() as $nestedType) {
                $schema->allOf[] = $this->extractPropertySingleType(
                    (string)$nestedType,
                    $attributes,
                    new SchemaWrapper(new OA\Property()),
                )->unwrap();
            }
        } else {
            $this->extractPropertySingleType($type->getName(), $attributes, $schema);
        }

        return $schema;
    }

    private function extractPropertySingleType(
        ?string $type,
        array $attributes,
        SchemaWrapper $schema,
    ): SchemaWrapper {
        foreach ($attributes as $attribute) {
            if ($attribute instanceof Assert\Type) {
                $type = $attribute->type;
                break;
            }
        }

        if ('int' === $type || 'integer' === $type) {
            $schema->type = 'integer';
            $schema->format = 'int32';
        } elseif ('float' === $type || 'double' === $type) {
            $schema->type = 'number';
            $schema->format = 'double';
        } elseif ('bool' === $type || 'boolean' === $type) {
            $schema->type = 'boolean';
        } elseif ('string' === $type) {
            $schema->type = 'string';
        } elseif ('array' === $type) {
            $schema->type = 'array';
            $schema->items = new OA\Items();
        } elseif (class_exists($type)) {
            $reflectionTypeClass = new ReflectionClass($type);

            if ($reflectionTypeClass->implementsInterface(DateTimeInterface::class)) {
                $schema->type = 'date-time';
                $schema->format = 'date-time';
            } elseif ($reflectionTypeClass->isUserDefined()) {
                $schema = $this->processModelThroughReflection($schema, $type);
            } else {
                throw new LogicException(\sprintf('Internal class "%s" is not supported.', $type));
            }
        } else {
            throw new LogicException(\sprintf('Type "%s" must be one of: int, float, string, array, class.', $type));
        }

        $attributesToCheck = [
            Assert\Choice::class => function (Assert\Choice $assert) use ($schema) {
                $schema->enum = $assert->choices;
            },
            Assert\Email::class => function (Assert\Email $assert) use ($schema) {
                $schema->format = 'email';
            },
            Assert\PasswordStrength::class => function (Assert\PasswordStrength $assert) use ($schema) {
                $schema->format = 'password';
            },
            Assert\Length::class => function (Assert\Length $assert) use ($schema) {
                $schema->minimum = $assert->min ?? Generator::UNDEFINED;
                $schema->minLength = $assert->min ?? Generator::UNDEFINED;
                $schema->maximum = $assert->max ?? Generator::UNDEFINED;
                $schema->maxLength = $assert->max ?? Generator::UNDEFINED;
            },
            Assert\Count::class => function (Assert\Count $assert) use ($schema) {
                $schema->minItems = $assert->min ?? Generator::UNDEFINED;
                $schema->maxItems = $assert->max ?? Generator::UNDEFINED;
            },
            Assert\Unique::class => function (Assert\Unique $assert) use ($schema) {
                $schema->uniqueItems = true;
            },
            Assert\All::class => function (Assert\All $assert) use ($schema) {
                $this->extractPropertySingleType(
                    null,
                    $assert->getNestedConstraints(),
                    new SchemaWrapper($schema->items),
                )->unwrap();
            },
        ];

        foreach ($attributes as $attribute) {
            $className = $attribute::class;

            if (\array_key_exists($className, $attributesToCheck)) {
                $attributesToCheck[$className]($attribute);
            }
        }

        return $schema;
    }

    private function extractPropertyNullable(ReflectionProperty $property, SchemaWrapper $schema): SchemaWrapper
    {
        /** @var Assert\NotBlank|null */
        $assertNotBlank = $this->extractAttribute($property, Assert\NotBlank::class);
        /** @var Assert\NotNull|null */
        $assertNotNull = $this->extractAttribute($property, Assert\NotNull::class);

        if (null !== $assertNotBlank || null !== $assertNotNull) {
            $schema->nullable = false;

            return $schema;
        }

        $type = $property->getType();
        $schema->nullable = $type->allowsNull();

        return $schema;
    }

    private function extractAttribute(ReflectionProperty $property, string $className): ?object
    {
        $attribute = $property->getAttributes($className);

        return empty($attribute) ? null : reset($attribute)->newInstance();
    }
}
