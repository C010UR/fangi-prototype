<?php

declare(strict_types=1);

namespace App\ListQueryManagement\Model;

use Symfony\Component\Serializer\Attribute as Serializer;

class LqmResultMeta
{
    private int $page;
    private int $pageSize;
    private int $totalItems;
    private int $totalPages;
    private array $orders;
    private array $filters;
    private ?string $search;
    private ?array $additionalData = null;
    private array $additionalDataContext = [];

    public function setPage(int $page): self
    {
        $this->page = $page;

        return $this;
    }

    #[Serializer\SerializedName('page')]
    public function getPage(): int
    {
        return $this->page;
    }

    public function setPageSize(int $pageSize): self
    {
        $this->pageSize = $pageSize;

        return $this;
    }

    #[Serializer\SerializedName('page_size')]
    public function getPageSize(): int
    {
        return $this->pageSize;
    }

    public function setTotalItems(int $totalItems): self
    {
        $this->totalItems = $totalItems;

        return $this;
    }

    #[Serializer\SerializedName('total_items')]
    public function getTotalItems(): int
    {
        return $this->totalItems;
    }

    public function setTotalPages(int $totalPages): self
    {
        $this->totalPages = $totalPages;

        return $this;
    }

    #[Serializer\SerializedName('total_pages')]
    public function getTotalPages(): int
    {
        return $this->totalPages;
    }

    public function setOrders(array $orders): self
    {
        $this->orders = $orders;

        return $this;
    }

    public function addOrder(string $field, string $direction): self
    {
        $this->orders[] = [
            'field' => $field,
            'direction' => $direction,
        ];

        return $this;
    }

    #[Serializer\SerializedName('orders')]
    public function getOrders(): array
    {
        return $this->orders;
    }

    public function setFilters(array $filters): self
    {
        $this->filters = $filters;

        return $this;
    }

    public function addFilter(string $field, string $operator, mixed $value): self
    {
        $this->filters[] = [
            'field' => $field,
            'operator' => $operator,
            'value' => $value,
        ];

        return $this;
    }

    #[Serializer\SerializedName('filters')]
    public function getFilters(): array
    {
        return $this->filters;
    }

    public function setSearch(string $search): self
    {
        $this->search = $search;

        return $this;
    }

    #[Serializer\SerializedName('search')]
    public function getSearch(): ?string
    {
        return $this->search;
    }

    public function setAdditionalData(array $additionalData): self
    {
        $this->additionalData = $additionalData;

        return $this;
    }

    public function addAdditionalData(string $key, mixed $value): self
    {
        $this->additionalData[$key] = $value;

        return $this;
    }

    #[Serializer\SerializedName('additional_data')]
    #[Serializer\Context(['dynamic_context' => 'getAdditionalDataContext'])]
    public function getAdditionalData(): ?array
    {
        return $this->additionalData;
    }

    public function setAdditionalDataContext(array $additionalDataContext): self
    {
        $this->additionalDataContext = $additionalDataContext;

        return $this;
    }

    #[Serializer\Ignore]
    public function getAdditionalDataContext(): array
    {
        return $this->additionalDataContext;
    }
}
