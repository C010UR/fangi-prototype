<?php

declare(strict_types=1);

namespace App\ListQueryManagement;

use App\ListQueryManagement\Model\LqmEntityConfig;
use App\ListQueryManagement\Model\QueryFilter;
use App\ListQueryManagement\Model\QueryOrder;
use App\ListQueryManagement\Model\QueryParamAliasMap;
use Closure;
use Doctrine\ORM\QueryBuilder;
use LogicException;
use Symfony\Component\HttpFoundation\Request;

class LqmProcessor
{
    public const string KEY_FILTERS = 'filter';
    public const string KEY_ORDERS = 'sort';
    public const string KEY_SEARCH = 'q';
    public const string KEY_PAGE = 'page';
    public const string KEY_PAGE_SIZE = 'page_size';

    public const int DEFAULT_PAGE = 1;
    public const int DEFAULT_PAGE_SIZE = 20;

    public const float SEARCH_SIMILARITY = 0.3;

    /** @var QueryFilter[] */
    private array $filters = [];
    /** @var QueryOrder[] */
    private array $orders = [];
    private ?string $search = null;
    private int $page = 1;
    private int $pageSize = 0;

    private LqmQueryExtractor $extractor;

    private LqmEntityConfig $config;

    private array $availableRoles;

    public function __construct(
        Request $request,
        string $entity,
        array $availableRoles,
    ) {
        $this->extractor = new LqmQueryExtractor();
        $this->config = LqmEntityConfig::create($entity);
        $this->availableRoles = $availableRoles;

        $query = $request->query->all();
        $this
            ->extractFilters($query)
            ->extractOrders($query)
            ->extractSearch($query)
            ->extractPage($query)
            ->extractPageSize($query);
    }

    private function extractFilters(array $query): static
    {
        if (!$this->config->supportsFiltering($this->availableRoles)) {
            return $this;
        }

        if (empty($this->config->getSupportedFilters($this->availableRoles))) {
            return $this;
        }

        $this->filters = $this->extractor->extractFilters(
            $query[static::KEY_FILTERS] ?? [],
            $this->config->getSupportedFilters($this->availableRoles),
        );

        return $this;
    }

    private function extractOrders(array $query): static
    {
        if (
            !$this->config->supportsOrdering($this->availableRoles)
            || empty($this->config->getSupportedOrders($this->availableRoles))
        ) {
            return $this;
        }

        $this->orders = $this->extractor->extractOrders(
            $query[static::KEY_ORDERS] ?? [],
            $this->config->getSupportedOrders($this->availableRoles),
        );

        return $this;
    }

    private function extractSearch(array $query): static
    {
        if (
            !$this->config->supportsSearching($this->availableRoles)
            || empty($this->config->getSupportedSearchParams($this->availableRoles))
        ) {
            return $this;
        }

        $this->search = $this->extractor->extractSearch($query[static::KEY_SEARCH] ?? null);

        return $this;
    }

    private function extractPage(array $query): static
    {
        if (!$this->config->supportsPagination($this->availableRoles)) {
            return $this;
        }

        $this->page = $this->extractor->extractPage($query[static::KEY_PAGE] ?? static::DEFAULT_PAGE)
            ?? static::DEFAULT_PAGE;

        return $this;
    }

    private function extractPageSize(array $query): static
    {
        if (!$this->config->supportsPagination($this->availableRoles)) {
            return $this;
        }

        $this->pageSize = $this->extractor->extractPageSize($query[static::KEY_PAGE_SIZE] ?? static::DEFAULT_PAGE_SIZE)
            ?? static::DEFAULT_PAGE_SIZE;

        return $this;
    }

    public function processQuery(
        QueryBuilder $query,
        QueryParamAliasMap $aliasMap,
        ?Closure $itemMapper = null,
    ): LqmResult {
        $queryBuilder = new LqmDoctrineQueryBuilder($query, $aliasMap);

        if ($this->config->supportsFiltering($this->availableRoles)) {
            $queryBuilder->buildFilters($this->filters);
        }

        if ($this->config->supportsSearching($this->availableRoles) && !empty($this->search)) {
            $queryBuilder->buildSearch(
                $this->search,
                $this->config->getSupportedSearchParams($this->availableRoles),
                static::SEARCH_SIMILARITY,
            );
        }

        $defaultOrder = $this->config->getDefaultOrder();

        if (null === $defaultOrder) {
            throw new LogicException(\sprintf('Default order is not configured for entity "%s"', $this->config->getEntity()));
        }

        if (!$this->config->supportsOrdering($this->availableRoles) || empty($this->orders)) {
            $this->orders = [
                new QueryOrder(
                    $defaultOrder->name,
                    $defaultOrder->property,
                    'asc',
                ),
            ];
        }

        $queryBuilder->buildOrders($this->orders);

        if ($this->config->supportsPagination($this->availableRoles)) {
            $queryBuilder->buildPagination($this->page, $this->pageSize);
        }

        $result = new LqmResult();

        $result->filters = $this->filters;
        $result->orders = $this->orders;
        $result->search = $this->search;
        $result->page = $this->page;
        $result->pageSize = $this->pageSize;

        $result->totalItems = $queryBuilder->getCountQuery()->getSingleScalarResult();
        $result->totalPages = 0 === $this->pageSize ? 1 : (int)ceil($result->totalItems / $this->pageSize);

        $result->data = $queryBuilder->getQuery()->getResult();

        if (null !== $itemMapper) {
            $result->data = array_map($itemMapper, $result->data);
        }

        return $result;
    }
}
