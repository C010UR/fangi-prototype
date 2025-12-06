<?php

declare(strict_types=1);

namespace App\OpenApi\Processor;

use App\Enum\UserRole;
use App\ListQueryManagement\Attribute as LqmA;
use App\ListQueryManagement\Attribute\Filter;
use App\ListQueryManagement\Attribute\OpenApi as LqmAO;
use App\ListQueryManagement\Attribute\Order;
use App\ListQueryManagement\Attribute\SeachParam;
use App\ListQueryManagement\LqmProcessor;
use App\ListQueryManagement\Model\LqmEntityConfig;
use OpenApi\Analysis;
use OpenApi\Annotations as OAA;
use OpenApi\Attributes as OA;
use OpenApi\Generator;
use ReflectionClass;
use Symfony\Component\DependencyInjection\Attribute\AsTaggedItem;

#[AsTaggedItem('nelmio_api_doc.swagger.processor')]
class LqmOpenApiProcessor
{
    public function __invoke(Analysis $analysis)
    {
        /** @var OAA\Operation $operation */
        foreach ($analysis->getAnnotationsOfType(OAA\Operation::class) ?? [] as $operation) {
            if (Generator::UNDEFINED !== $operation->parameters && null !== $operation->parameters) {
                foreach ($operation->parameters as $key => $parameter) {
                    if ($parameter instanceof LqmAO\ListParameters) {
                        $config = LqmEntityConfig::create($parameter->getClassName());
                        unset($operation->parameters[$key]);
                        $operation->parameters = array_merge($operation->parameters, $this->generateParameters($config));
                    }
                }
            }

            if (Generator::UNDEFINED !== $operation->responses && null !== $operation->responses) {
                foreach ($operation->responses as $key => $response) {
                    if (!is_iterable($response->content)) {
                        continue;
                    }

                    foreach ($response->content as $media) {
                        $schema = $media->schema;

                        if ($schema->ref instanceof LqmAO\ListResponse) {
                            $config = LqmEntityConfig::create($schema->ref->getClassName());
                            $schema->ref = Generator::UNDEFINED;
                            $this->processResponses($schema, $config);
                        }
                    }
                }
            }
        }

        foreach ($analysis->getAnnotationsOfType(OAA\Schema::class) ?? [] as $annotation) {
            $this->processSchema($annotation);
        }
    }

    private function processSchema(OAA\Schema $schema): void
    {
        if (!($schema->ref instanceof LqmAO\Model)) {
            return;
        }

        $reflection = new ReflectionClass($schema->ref->getClassName());

        /** @var LqmA\Schema|null $attribute */
        $attributes = $reflection->getAttributes(LqmA\Schema::class);
        $attribute = empty($attributes) ? null : reset($attributes)?->newInstance();

        if (null === $attribute) {
            return;
        }

        $schema->ref = $attribute->schema;
    }

    private function processResponses(OAA\Schema $schema, LqmEntityConfig $config): void
    {
        if ($config->getAdditionalDataSchema()) {
            $additionalDataSchema = new OA\Property(
                property: 'additional_data',
                ref: $config->getAdditionalDataSchema(),
            );
        } else {
            $additionalDataSchema = new OA\Property(
                property: 'additional_data',
                description: 'Not used in this response. Always null.',
                type: 'object',
                nullable: true,
            );
        }

        $schema->type = 'object';
        $schema->required = [
            'meta',
            'data',
        ];
        $schema->properties = [
            new OA\Property(
                property: 'meta',
                type: 'object',
                description: 'List metadata, e.g. Filters/Orders/Searches applied, Pagination information.',
                required: [
                    'filters',
                    'orders',
                    'search',
                    'page',
                    'page_size',
                    'total_items',
                    'total_pages',
                ],
                properties: [
                    $additionalDataSchema,
                    new OA\Property(
                        property: 'filters',
                        type: 'array',
                        description: 'Filters applied to request.',
                        items: new OA\Items(
                            required: [
                                'field',
                                'operator',
                                'value',
                            ],
                            type: 'object',
                            properties: [
                                new OA\Property(
                                    property: 'field',
                                    type: 'string',
                                    description: 'Field name.',
                                    example: 'name',
                                ),
                                new OA\Property(
                                    property: 'operator',
                                    type: 'string',
                                    example: 'eq',
                                    description: 'Filter operator.',
                                    enum: array_map(fn($case) => $case->value, LqmA\FilterOperator::cases()),
                                ),
                                new OA\Property(
                                    property: 'value',
                                    oneOf: [
                                        new OA\Property(
                                            type: 'string',
                                        ),
                                        new OA\Property(
                                            type: 'array',
                                            items: new OA\Items(
                                                type: 'string',
                                            ),
                                        ),
                                    ],
                                    nullable: true,
                                    description: <<<DESCRIPTION
                                        Filter value.

                                        * __null__ - if `null`, `notnull`, `true`, `false`;
                                        * __array__ - if `in`, `nin`;
                                        * __string__ - if `eq`, `ne`, `gt`, `gte`, `lt`, `lte`, `like`.
                                        DESCRIPTION,
                                    example: 'John',
                                ),
                            ],
                        ),
                    ),
                    new OA\Property(
                        property: 'orders',
                        type: 'array',
                        description: 'Orders applied to request.',
                        items: new OA\Items(
                            type: 'object',
                            required: [
                                'field',
                                'order',
                            ],
                            properties: [
                                new OA\Property(
                                    property: 'field',
                                    type: 'string',
                                    description: 'Field name.',
                                    example: 'id',
                                ),
                                new OA\Property(
                                    property: 'order',
                                    type: 'string',
                                    enum: ['asc', 'desc'],
                                    description: 'Order direction.',
                                    example: 'asc',
                                ),
                            ],
                        ),
                    ),
                    new OA\Property(
                        property: 'search',
                        type: 'string',
                        description: 'Search applied to request.',
                        example: 'Search',
                    ),
                    new OA\Property(
                        property: 'page',
                        type: 'integer',
                        description: 'Page number of fetched data.',
                        example: 1,
                    ),
                    new OA\Property(
                        property: 'page_size',
                        type: 'integer',
                        description: 'Page size of fetched data.',
                        example: 0,
                    ),
                    new OA\Property(
                        property: 'total_items',
                        type: 'integer',
                        description: 'Total number of items available.',
                        example: 7,
                    ),
                    new OA\Property(
                        property: 'total_pages',
                        type: 'integer',
                        description: 'Total number of pages available.',
                        example: 1,
                    ),
                ],
            ),
            new OA\Property(
                property: 'data',
                type: 'array',
                description: 'Fetched list.',
                items: new OA\Items(ref: $config->getSchema()),
            ),
        ];
    }

    private function generateParameters(LqmEntityConfig $config): array
    {
        $parameters = [];

        if ($config->supportsSearching() && !empty($searchParams = $config->getSupportedSearchParams())) {
            $parameters[] = $this->createSearchParameter($searchParams, $config->getSearchRoles());
        }

        if ($config->supportsFiltering() && !empty($filters = $config->getSupportedFilters())) {
            $parameters[] = $this->createFilterParameter($filters, $config->getFilterRoles());
        }

        if ($config->supportsOrdering() && !empty($orders = $config->getSupportedOrders())) {
            $parameters[] = $this->createSortParameter($orders, $config->getOrderRoles());
        }

        if ($config->supportsPagination()) {
            $parameters[] = $this->createPageParameter($config->getPaginationRoles());
            $parameters[] = $this->createPageSizeParameter($config->getPaginationRoles());
        }

        return $parameters;
    }

    private function stringifyRoles(?array $roles): string
    {
        return '[__' . implode('__, __', $roles ?? [UserRole::PUBLIC]) . '__]';
    }

    /**
     * @param SeachParam[] $searchParams
     */
    private function createSearchParameter(array $searchParams, ?array $roles): OA\Parameter
    {
        $roles = $this->stringifyRoles($roles);
        $bulletItem = 1;
        $fieldList = array_map(
            fn(LqmA\SearchParam $searchParam) => \sprintf('%d. `%s`. Roles: %s;', $bulletItem++, $searchParam->name, $this->stringifyRoles($searchParam->roles)),
            $searchParams,
        );
        $fieldText = implode("\n", $fieldList);

        return new OA\QueryParameter(
            name: LqmProcessor::KEY_SEARCH,
            required: false,
            description: <<<DESCRIPTION
                Search query. Roles: $roles.

                __Search is conducted on__:

                $fieldText
                DESCRIPTION,
            schema: new OA\Schema(
                type: 'string',
                example: '13,5 PCO 1881 L84,6 CL R30',
            ),
        );
    }

    /**
     * @param Order[] $orders
     */
    private function createSortParameter(array $orders, ?array $roles): OA\Parameter
    {
        $roles = $this->stringifyRoles($roles);
        $bulletItem = 1;
        $fieldList = array_map(
            fn($order) => \sprintf('%d. `%s`. Roles: %s;', $bulletItem++, $order->name, $this->stringifyRoles($order->roles)),
            $orders,
        );
        $firstField = reset($orders)->name;
        $fieldText = implode("\n", $fieldList);

        return new OA\QueryParameter(
            name: LqmProcessor::KEY_ORDERS . '[]',
            required: false,
            description: <<<DESCRIPTION
                List of fields to sort by. Roles: $roles.

                __Format__: `$firstField` (ascending) or `-$firstField` (descending).

                __Available fields__:

                $fieldText
                DESCRIPTION,
            style: 'form',
            explode: true,
            schema: new OA\Schema(
                type: 'array',
                items: new OA\Items(
                    type: 'string',
                    pattern: '^-?[a-zA-Z_][a-zA-Z0-9_]*$',
                    example: '-' . $firstField,
                ),
            ),
        );
    }

    /**
     * @param Filter[] $filters
     */
    private function createFilterParameter(array $filters, ?array $roles): OA\Parameter
    {
        $operatorDescriptions = [
            LqmA\FilterOperator::Equal->value => 'equals (default)',
            LqmA\FilterOperator::NotEqual->value => 'not equals',
            LqmA\FilterOperator::GreaterThan->value => 'greater than',
            LqmA\FilterOperator::GreaterThanOrEqual->value => 'greater than or equal',
            LqmA\FilterOperator::LessThan->value => 'less than',
            LqmA\FilterOperator::LessThanOrEqual->value => 'less than or equal',
            LqmA\FilterOperator::Like->value => 'contains (case-insensitive)',
            LqmA\FilterOperator::In->value => 'in list (comma-separated values)',
            LqmA\FilterOperator::NotIn->value => 'not in list',
            LqmA\FilterOperator::IsNull->value => 'is null',
            LqmA\FilterOperator::IsNotNull->value => 'is not null',
            LqmA\FilterOperator::True->value => 'is truthy',
            LqmA\FilterOperator::False->value => 'is falsy',
        ];

        $filterDefinitions = [];
        $operatorDefinitions = [];

        $bulletItem = 1;

        foreach ($filters as $filter) {
            if (empty($filter->operators)) {
                continue;
            }

            $definition = \sprintf('%d. `%s`. Roles: %s;', $bulletItem++, $filter->name, $this->stringifyRoles($filter->roles));
            $definition .= "\n    * Operators: " . implode(
                ', ',
                array_map(
                    fn(LqmA\FilterOperator $operator) => '`' . $operator->value . '`',
                    $filter->operators,
                ),
            );

            if (null !== $filter->defaultValue) {
                $defaultOperator = $filter->defaultValueOperator?->value ?? LqmA\FilterOperator::Equal->value;
                $definition .= \sprintf(
                    "\n    * Default: `%s:%s:%s`",
                    $filter->name,
                    $defaultOperator,
                    $filter->defaultValue,
                );
            }

            if (null !== $filter->allowedValues) {
                $definition .= "\n    * Allowed values: " . implode(
                    ', ',
                    array_map(
                        fn(string $value) => '`' . $value . '`',
                        $filter->allowedValues,
                    ),
                );
            }

            $filterDefinitions[] = $definition;

            foreach ($filter->operators as $operator) {
                $operatorValue = $operator->value;

                if (isset($operatorDescriptions[$operatorValue])) {
                    $operatorDefinitions[$operatorValue] = '* __' . $operatorValue . '__ - ' . $operatorDescriptions[$operatorValue];
                }
            }
        }

        $roles = $this->stringifyRoles($roles);
        $fieldText = implode("\n", array_values($filterDefinitions));
        $operatorDescription = implode("\n", array_values($operatorDefinitions));

        $firstFilter = reset($filters);
        $firstExample = "{$firstFilter->name}:eq:John";
        $secondExample = "{$firstFilter->name}:true";

        return new OA\QueryParameter(
            name: LqmProcessor::KEY_FILTERS . '[]',
            required: false,
            description: <<<DESCRIPTION
                List of filters. Roles: $roles.

                __Format__: `$firstExample` or `$secondExample` (for `null`, `isnotnull`, `true`, `false`)

                __Available fields__:
                $fieldText

                __Operator descriptions__:
                $operatorDescription
                DESCRIPTION,
            explode: true,
            style: 'form',
            schema: new OA\Schema(
                type: 'array',
                items: new OA\Items(
                    type: 'string',
                    pattern: '^[a-zA-Z_][a-zA-Z0-9_]*(:([a-z]+))?:.*$',
                    example: $firstExample,
                ),
            ),
        );
    }

    private function createPageParameter(?string $roles): OA\Parameter
    {
        return new OA\QueryParameter(
            name: LqmProcessor::KEY_PAGE,
            required: false,
            description: \sprintf(
                'Page number (defaults to %s). Roles: %s.',
                LqmProcessor::DEFAULT_PAGE,
                $this->stringifyRoles($roles),
            ),
            schema: new OA\Schema(
                type: 'integer',
                format: 'int32',
                minimum: 1,
                example: 1,
            ),
        );
    }

    private function createPageSizeParameter(?string $roles): OA\Parameter
    {
        return new OA\QueryParameter(
            name: LqmProcessor::KEY_PAGE_SIZE,
            required: false,
            description: \sprintf(
                'Number of items per page (0 for infinite size, defaults to %s). Roles: %s.',
                LqmProcessor::DEFAULT_PAGE_SIZE,
                $this->stringifyRoles($roles),
            ),
            schema: new OA\Schema(
                type: 'integer',
                format: 'int32',
                minimum: 0,
                example: 13,
            ),
        );
    }
}
