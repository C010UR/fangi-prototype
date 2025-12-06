<?php

declare(strict_types=1);

namespace App\ListQueryManagement;

use Symfony\Component\Serializer\Attribute as Serializer;

class LqmResult
{
    public array $data;

    #[Serializer\Ignore]
    public int $page;

    #[Serializer\Ignore]
    public int $pageSize;

    #[Serializer\Ignore]
    public int $totalItems;

    #[Serializer\Ignore]
    public int $totalPages;

    #[Serializer\Ignore]
    public array $orders;

    #[Serializer\Ignore]
    public array $filters;

    #[Serializer\Ignore]
    public ?string $search;

    #[Serializer\Ignore]
    public ?array $additionalData = null;

    public function __construct()
    {
    }

    #[Serializer\Groups(['short', 'long'])]
    #[Serializer\SerializedName('meta')]
    public function getMeta(): array
    {
        return [
            'filters' => $this->filters,
            'orders' => $this->orders,
            'search' => $this->search,
            'page' => $this->page,
            'page_size' => $this->pageSize,
            'total_items' => $this->totalItems,
            'total_pages' => $this->totalPages,
            'additional_data' => $this->additionalData,
        ];
    }

    #[Serializer\Groups(['short', 'long'])]
    #[Serializer\SerializedName('data')]
    public function getData(): array
    {
        return $this->data;
    }
}
