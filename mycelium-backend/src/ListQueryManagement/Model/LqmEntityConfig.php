<?php

declare(strict_types=1);

namespace App\ListQueryManagement\Model;

use App\ListQueryManagement\Attribute as LqmA;
use InvalidArgumentException;
use LogicException;
use ReflectionClass;

class LqmEntityConfig
{
    private static $instances = [];
    private string $schema;
    private ?string $additionalDataSchema = null;

    private bool $supportsFiltering = false;
    /** @var string[]|null */
    private ?array $filterRoles = null;
    /** @var LqmA\Filter[] */
    private array $filters = [];

    private bool $supportsOrdering = false;
    /** @var string[]|null */
    private ?array $orderRoles = null;
    /** @var LqmA\Order[] */
    private array $orders = [];
    private ?LqmA\Order $defaultOrder = null;

    private bool $supportsSearching = false;

    /** @var string[]|null */
    private ?array $searchRoles = null;

    /** @var LqmA\Search[] */
    private array $searchParams = [];
    private bool $supportsPagination = false;

    /** @var string[]|null */
    private ?array $paginationRoles = null;

    private function __construct(private string $entity)
    {
    }

    public static function create(string $entity): static
    {
        if (\array_key_exists($entity, static::$instances)) {
            return static::$instances[$entity];
        }

        $object = new static($entity);

        $reflection = new ReflectionClass($entity);

        $schema = $reflection->getAttributes(LqmA\Schema::class);

        if (empty($schema)) {
            throw new LogicException(\sprintf('Entity "%s" does not have an attribute "%s".', $entity, LqmA\Schema::class));
        }

        $schema = reset($schema)->newInstance();
        $object->schema = $schema->schema;
        $object->additionalDataSchema = $schema->additionalDataSchema;

        $filters = $reflection->getAttributes(LqmA\Filters::class);
        $filters = $filters ? reset($filters)->newInstance() : null;

        $orders = $reflection->getAttributes(LqmA\Orders::class);
        $orders = $orders ? reset($orders)->newInstance() : null;

        $search = $reflection->getAttributes(LqmA\Search::class);
        $search = $search ? reset($search)->newInstance() : null;

        $pagination = $reflection->getAttributes(LqmA\Pagination::class);
        $pagination = $pagination ? reset($pagination)->newInstance() : null;

        $object
            ->loadFilterReflection($filters)
            ->loadOrderReflection($orders)
            ->loadSearchReflection($search)
            ->loadPaginationReflection($pagination);

        static::$instances[$entity] = $object;

        return $object;
    }

    private function loadFilterReflection(?LqmA\Filters $attribute): self
    {
        $this->supportsFiltering = null !== $attribute;

        if (!$this->supportsFiltering) {
            return $this;
        }

        $this->filterRoles = $this->mapRoles($attribute->roles);
        $this->filters = [];

        foreach ($attribute->filters as $filter) {
            if (!($filter instanceof LqmA\Filter)) {
                throw new InvalidArgumentException(\sprintf('"%s" contains filter of type "%s" when it should only have "%s"', LqmA\Filters::class, get_debug_type($filter), LqmA\Filter::class));
            }

            foreach ($filter->operators as $operator) {
                if (!$operator instanceof LqmA\FilterOperator) {
                    throw new InvalidArgumentException(\sprintf('"%s" contains operator of type "%s" when it should only have "%s"', LqmA\Filter::class, get_debug_type($operator), LqmA\FilterOperator::class));
                }
            }

            $filter->roles = $this->mapRoles($filter->roles);

            $this->filters[] = $filter;
        }

        return $this;
    }

    private function loadOrderReflection(?LqmA\Orders $attribute): self
    {
        $this->supportsOrdering = null !== $attribute;

        if (!$this->supportsOrdering) {
            return $this;
        }

        $this->orderRoles = $this->mapRoles($attribute->roles);
        $this->defaultOrder = $attribute->defaultOrder;
        $this->orders = [];

        foreach ($attribute->orders as $order) {
            if (!($order instanceof LqmA\Order)) {
                throw new InvalidArgumentException(\sprintf('"%s" contains order of type "%s" when it should only have "%s"', LqmA\Orders::class, get_debug_type($order), LqmA\Order::class));
            }

            $order->roles = $this->mapRoles($order->roles);
            $this->orders[] = $order;
        }

        return $this;
    }

    private function loadSearchReflection(?LqmA\Search $attribute): self
    {
        $this->supportsSearching = null !== $attribute;

        if (!$this->supportsSearching) {
            return $this;
        }

        $this->searchRoles = $this->mapRoles($attribute->roles);

        foreach ($attribute->searchParams as $searchParam) {
            $searchParam->roles = $this->mapRoles($searchParam->roles);
            $this->searchParams[] = $searchParam;
        }

        return $this;
    }

    private function loadPaginationReflection(?LqmA\Pagination $attribute): self
    {
        $this->supportsPagination = null !== $attribute;

        if (!$this->supportsPagination) {
            return $this;
        }

        $this->paginationRoles = $this->mapRoles($attribute->roles);

        return $this;
    }

    private function mapRoles(?array $roles): ?array
    {
        if (null === $roles || empty($roles)) {
            return null;
        }

        $roles = array_unique($roles);

        foreach ($roles as $role) {
            if (!\is_string($role)) {
                throw new InvalidArgumentException('Roles is not a string.');
            }
        }

        return $roles;
    }

    private function containsRoles(?array $userRoles, ?array $requiredRoles): bool
    {
        return null === $userRoles || null === $requiredRoles || !empty(array_intersect($userRoles, $requiredRoles));
    }

    /**
     * @param string[]|null $roles
     */
    public function supportsFiltering(?array $roles = null): bool
    {
        return $this->supportsFiltering && $this->containsRoles($roles, $this->filterRoles);
    }

    /**
     * @return string[]|null
     */
    public function getFilterRoles(): ?array
    {
        return $this->filterRoles;
    }

    /**
     * @param string[]|null $roles
     *
     * @return LqmA\Filter[]
     */
    public function getSupportedFilters(?array $roles = null): array
    {
        return array_filter(
            $this->filters,
            fn(LqmA\Filter $filter) => $this->containsRoles($roles, $filter->roles),
        );
    }

    /**
     * @param string[]|null $roles
     */
    public function supportsOrdering(?array $roles = null): bool
    {
        return $this->supportsOrdering && $this->containsRoles($roles, $this->orderRoles);
    }

    /**
     * @return string[]|null
     */
    public function getOrderRoles(): ?array
    {
        return $this->orderRoles;
    }

    /**
     * @param string[]|null $roles
     *
     * @return LqmA\Order[]
     */
    public function getSupportedOrders(?array $roles = null): array
    {
        return array_filter(
            $this->orders,
            fn(LqmA\Order $order) => $this->containsRoles($roles, $order->roles),
        );
    }

    public function getDefaultOrder(): ?LqmA\Order
    {
        return $this->defaultOrder;
    }

    /**
     * @param string[]|null $roles
     */
    public function supportsSearching(?array $roles = null): bool
    {
        return $this->supportsSearching && $this->containsRoles($roles, $this->searchRoles);
    }

    /**
     * @return string[]|null
     */
    public function getSearchRoles(): ?array
    {
        return $this->searchRoles;
    }

    /**
     * @param string[]|null $roles
     *
     * @return LqmA\SearchParam[]
     */
    public function getSupportedSearchParams(?array $roles = null): array
    {
        return array_filter(
            $this->searchParams,
            fn(LqmA\SearchParam $search) => $this->containsRoles($roles, $search->roles),
        );
    }

    /**
     * @param string[]|null $roles
     */
    public function supportsPagination(?array $roles = null): bool
    {
        return $this->supportsPagination && $this->containsRoles($roles, $this->paginationRoles);
    }

    /**
     * @return string[]|null
     */
    public function getPaginationRoles(): ?array
    {
        return $this->paginationRoles;
    }

    public function getEntity(): string
    {
        return $this->entity;
    }

    public function getEntityName(): string
    {
        return basename(str_replace('\\', '/', $this->entity));
    }

    public function getSchema(): string
    {
        return $this->schema;
    }

    public function getAdditionalDataSchema(): ?string
    {
        return $this->additionalDataSchema;
    }
}
