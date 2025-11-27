<?php

declare(strict_types=1);

namespace App\ListQueryManagement\Attribute;

use Attribute;

#[Attribute(Attribute::TARGET_CLASS | Attribute::IS_REPEATABLE)]
class Filter
{
    /** @var FilterOperator[] */
    public array $operators;

    /**
     * @param string|callable  $property
     * @param FilterOperator[] $operators
     * @param string[]|null    $allowedValues
     * @param string[]|null    $roles
     */
    public function __construct(
        public string $name,
        public mixed $property,
        array $operators,
        public ?array $allowedValues = null,
        public ?FilterOperator $defaultValueOperator = null,
        public ?string $defaultValue = null,
        public ?array $roles = null,
    ) {
        $this->operators = [];

        foreach ($operators as $operator) {
            $this->operators[$operator->value] = $operator;
        }
    }
}
