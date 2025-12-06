<?php

declare(strict_types=1);

namespace App\Entity;

use App\Entity\Trait\TimestampableEntityTrait;
use App\Repository\FileIndexRepository;
use App\Serializer\Interface\DepthAwareNormalizableInterface;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute as Serializer;

#[ORM\Entity(repositoryClass: FileIndexRepository::class)]
#[ORM\HasLifecycleCallbacks]
class FileIndex implements DepthAwareNormalizableInterface
{
    use TimestampableEntityTrait;

    #[ORM\Id]
    #[ORM\Column(length: 1024)]
    private ?string $path = null;

    #[ORM\Column(length: 1024, nullable: true)]
    private ?string $parent = null;

    #[ORM\Column(length: 1024)]
    private ?string $name = null;

    #[ORM\Column(length: 255)]
    private ?string $contentType = null;

    #[ORM\Column]
    private ?bool $isDirectory = null;

    #[ORM\Column]
    private ?int $permissions = null;

    #[ORM\ManyToOne]
    private ?User $createdBy = null;

    #[ORM\ManyToOne]
    private ?User $updatedBy = null;

    #[Serializer\Groups(['short', 'long'])]
    #[Serializer\SerializedName('path')]
    public function getPath(): ?string
    {
        return $this->path;
    }

    public function setPath(string $path): static
    {
        $this->path = $path;

        return $this;
    }

    #[Serializer\Groups(['short', 'long'])]
    #[Serializer\SerializedName('parent')]
    public function getParent(): ?string
    {
        return $this->parent;
    }

    public function setParent(?string $parent): static
    {
        $this->parent = $parent;

        return $this;
    }

    #[Serializer\Groups(['short', 'long'])]
    #[Serializer\SerializedName('name')]
    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): static
    {
        $this->name = $name;

        return $this;
    }

    #[Serializer\Groups(['short', 'long'])]
    #[Serializer\SerializedName('content_type')]
    public function getContentType(): ?string
    {
        return $this->contentType;
    }

    public function setContentType(string $contentType): static
    {
        $this->contentType = $contentType;

        return $this;
    }

    #[Serializer\Groups(['short', 'long'])]
    #[Serializer\SerializedName('is_directory')]
    public function isDirectory(): ?bool
    {
        return $this->isDirectory;
    }

    public function setIsDirectory(bool $isDirectory): static
    {
        $this->isDirectory = $isDirectory;

        return $this;
    }

    public function getPermissions(): ?int
    {
        return $this->permissions;
    }

    public function setPermissions(int $permissions): static
    {
        $this->permissions = $permissions;

        return $this;
    }

    #[Serializer\Ignore]
    public function getCreatedBy(): ?User
    {
        return $this->createdBy;
    }

    #[Serializer\Groups(['short', 'long'])]
    #[Serializer\SerializedName('created_by')]
    public function getCreatedByFormattedName(): ?string
    {
        return $this->createdBy?->getFormattedName();
    }

    public function setCreatedBy(?User $createdBy): static
    {
        $this->createdBy = $createdBy;

        return $this;
    }

    #[Serializer\Ignore]
    public function getUpdatedBy(): ?User
    {
        return $this->updatedBy;
    }

    #[Serializer\Groups(['short', 'long'])]
    #[Serializer\SerializedName('updated_by')]
    public function getUpdatedByFormattedName(): ?string
    {
        return $this->updatedBy?->getFormattedName();
    }

    public function setUpdatedBy(?User $updatedBy): static
    {
        $this->updatedBy = $updatedBy;

        return $this;
    }
}
