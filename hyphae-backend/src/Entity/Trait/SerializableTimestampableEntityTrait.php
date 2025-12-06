<?php

declare(strict_types=1);

namespace App\Entity\Trait;

use DateTimeImmutable;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute as Serializer;

trait SerializableTimestampableEntityTrait
{
    #[ORM\Column]
    private ?DateTimeImmutable $createdAt = null;

    #[ORM\Column]
    private ?DateTimeImmutable $updatedAt = null;

    #[Serializer\Groups(['short', 'long'])]
    #[Serializer\SerializedName('created_at')]
    public function getCreatedAt(): DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function setCreatedAt(DateTimeImmutable $createdAt): static
    {
        $this->createdAt = $createdAt;

        return $this;
    }

    #[ORM\PrePersist]
    public function updateDatesOnCreate(): void
    {
        if (null !== $this->createdAt) {
            $this->updatedAt = $this->createdAt;
        } else {
            $now = new DateTimeImmutable();
            $this->createdAt = $now;
            $this->updatedAt = $now;
        }
    }

    #[Serializer\Groups(['short', 'long'])]
    #[Serializer\SerializedName('updated_at')]
    public function getUpdatedAt(): DateTimeImmutable
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(DateTimeImmutable $updatedAt): static
    {
        $this->updatedAt = $updatedAt;

        return $this;
    }

    #[ORM\PreUpdate]
    public function updateDatesOnUpdate(): void
    {
        $this->updatedAt = new DateTimeImmutable();
    }
}
