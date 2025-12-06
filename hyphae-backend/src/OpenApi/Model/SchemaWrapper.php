<?php

declare(strict_types=1);

namespace App\OpenApi\Model;

use App\OpenApi\Attribute as OAC;
use InvalidArgumentException;
use OpenApi\Annotations as OAA;
use OpenApi\Attributes as OA;
use ReflectionClass;
use UnitEnum;

/**
 * Schema wrapper for OpenAPI schema objects with dynamic property access.
 *
 * @property string                                             $property             The key into Schema->properties array.
 * @property string|class-string|object                         $ref                  The relative or absolute path to the endpoint.
 * @property string                                             $schema               The key into Components->schemas array.
 * @property string                                             $title                Can be used to decorate a user interface with information about the data produced by this user interface. Preferably short; use description for more details.
 * @property string                                             $description          A description will provide explanation about the purpose of the instance described by this schema.
 * @property int                                                $maxProperties        The maximum number of properties allowed in an object instance. An object instance is valid against this property if its number of properties is less than, or equal to, the value of this attribute.
 * @property int                                                $minProperties        The minimum number of properties allowed in an object instance. An object instance is valid against this property if its number of properties is greater than, or equal to, the value of this attribute.
 * @property string[]                                           $required             An object instance is valid against this property if its property set contains all elements in this property's array value.
 * @property Property[]                                         $properties           A collection of properties to define for an object. Each property is represented as an instance of the Property class.
 * @property string|non-empty-array<string>                     $type                 The type of the schema/property. OpenApi v3.0: The value MUST be one of "string", "number", "integer", "boolean", "array" or "object". Since OpenApi v3.1 an array of types may be used.
 * @property string                                             $format               The extending format for the previously mentioned type.
 * @property OA\Items                                           $items                Required if type is "array". Describes the type of items in the array.
 * @property string                                             $collectionFormat     Determines the format of the array if type array is used. Possible values are: csv, ssv, tsv, pipes, multi.
 * @property mixed                                              $default              Sets a default value to the parameter. The type of the value depends on the defined type.
 * @property int|float                                          $maximum              The maximum value allowed for a numeric property. This value must be a number.
 * @property bool|int|float                                     $exclusiveMaximum     A boolean indicating whether the maximum value is excluded from the set of valid values.
 * @property int|float                                          $minimum              The minimum value allowed for a numeric property. This value must be a number.
 * @property bool|int|float                                     $exclusiveMinimum     A boolean indicating whether the minimum value is excluded from the set of valid values.
 * @property int                                                $maxLength            The maximum length of a string property. A string instance is valid against this property if its length is less than, or equal to, the value of this attribute.
 * @property int                                                $minLength            The minimum length of a string property. A string instance is valid against this property if its length is greater than, or equal to, the value of this attribute.
 * @property int                                                $maxItems             The maximum number of items allowed in an array property. An array instance is valid against this property if its number of items is less than, or equal to, the value of this attribute.
 * @property int                                                $minItems             The minimum number of items allowed in an array property. An array instance is valid against this property if its number of items is greater than, or equal to, the value of this attribute.
 * @property bool                                               $uniqueItems          A boolean value indicating whether all items in an array property must be unique. If this attribute is set to true, then all items in the array must be unique.
 * @property string                                             $pattern              A string instance is considered valid if the regular expression matches the instance successfully.
 * @property array<string|int|float|bool|UnitEnum>|class-string $enum                 A collection of allowable values for a property. A property instance is valid against this attribute if its value is one of the values specified in this collection.
 * @property int|float                                          $multipleOf           A numeric instance is valid against "multipleOf" if the result of the division of the instance by this property's value is an integer.
 * @property OA\Discriminator                                   $discriminator        Adds support for polymorphism. The discriminator is an object name that is used to differentiate between other schemas which may satisfy the payload description.
 * @property bool                                               $readOnly             Declares the property as "read only". This means that it may be sent as part of a response but should not be sent as part of the request.
 * @property bool                                               $writeOnly            Declares the property as "write only". Therefore, it may be sent as part of a request but should not be sent as part of the response.
 * @property OA\Xml                                             $xml                  This may be used only on properties schemas. It has no effect on root schemas. Adds additional metadata to describe the XML representation of this property.
 * @property OA\ExternalDocumentation                           $externalDocs         Additional external documentation for this schema.
 * @property mixed                                              $example              A free-form property to include an example of an instance for this schema.
 * @property array<Examples>                                    $examples             Examples of the schema. Each example should contain a value in the correct format as specified in the parameter encoding.
 * @property bool                                               $nullable             Allows sending a null value for the defined schema. Default value is false.
 * @property bool                                               $deprecated           Specifies that a schema is deprecated and should be transitioned out of usage. Default value is false.
 * @property array<Schema|OA\Schema>                            $allOf                An instance validates successfully against this property if it validates successfully against all schemas defined by this property's value.
 * @property array<Schema|OA\Schema>                            $anyOf                An instance validates successfully against this property if it validates successfully against at least one schema defined by this property's value.
 * @property array<Schema|OA\Schema>                            $oneOf                An instance validates successfully against this property if it validates successfully against exactly one schema defined by this property's value.
 * @property mixed                                              $not                  JSON Schema validation: not constraint.
 * @property bool|OA\AdditionalProperties                       $additionalProperties JSON Schema validation: additionalProperties constraint.
 * @property mixed                                              $additionalItems      JSON Schema validation: additionalItems constraint.
 * @property mixed                                              $contains             JSON Schema validation: contains constraint.
 * @property mixed                                              $patternProperties    JSON Schema validation: patternProperties constraint.
 * @property mixed                                              $dependencies         JSON Schema validation: dependencies constraint.
 * @property mixed                                              $propertyNames        JSON Schema validation: propertyNames constraint.
 * @property mixed                                              $const                JSON Schema validation: const constraint.
 * @property array                                              $x                    Custom extensions.
 * @property array                                              $attachables          Attachable objects.
 */
class SchemaWrapper
{
    private array $updatedProperties = [];

    public function __construct(
        private OAA\Schema|OA\Property|OAC\Property $object,
    ) {
    }

    public function __set($name, $value)
    {
        $this->updatedProperties[$name] = $value;
    }

    public function &__get($name)
    {
        if (\array_key_exists($name, $this->updatedProperties)) {
            return $this->updatedProperties[$name];
        }

        if (!\array_key_exists($name, $this->updatedProperties)) {
            $this->updatedProperties[$name] = $this->object->{$name};
        }

        return $this->updatedProperties[$name];
    }

    public function __isset($name): bool
    {
        return \array_key_exists($name, $this->updatedProperties)
            || isset($this->object->{$name});
    }

    public function unwrap(?string $className = null): OAA\Schema|OA\Property|OAC\Property
    {
        if (null !== $className && !class_exists($className)) {
            throw new InvalidArgumentException("Class {$className} does not exist");
        }

        if (null !== $className) {
            $newObject = new ($className)();
            $updateAll = true;
        } else {
            $newObject = $this->object;
            $updateAll = false;
        }

        $newObjectReflection = new ReflectionClass($newObject);
        $oldObjectReflection = new ReflectionClass($this->object);

        foreach ($newObjectReflection->getProperties() as $property) {
            $propertyName = $property->getName();

            if (!$property->isPublic()) {
                continue;
            }

            if (\array_key_exists($propertyName, $this->updatedProperties)) {
                $newObject->{$propertyName} = $this->updatedProperties[$propertyName];
            } elseif ($updateAll && $oldObjectReflection->hasProperty($propertyName)) {
                $newObject->{$propertyName} = $this->object->{$propertyName};
            }
        }

        $this->object = $newObject;

        return $this->object;
    }
}
