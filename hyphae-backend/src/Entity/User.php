<?php

declare(strict_types=1);

namespace App\Entity;

use App\Entity\Trait\TimestampableEntityTrait;
use App\Repository\UserRepository;
use App\Serializer\Interface\DepthAwareNormalizableInterface;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Serializer\Attribute as Serializer;

#[ORM\Entity(repositoryClass: UserRepository::class)]
#[ORM\HasLifecycleCallbacks]
class User implements UserInterface, DepthAwareNormalizableInterface
{
    use TimestampableEntityTrait;
    public const string SYSTEM_EMAIL = 'system';

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 180)]
    private ?string $email = null;

    #[ORM\Column(length: 255)]
    private ?string $username = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $imageUrl = null;

    #[Serializer\Groups(['short', 'long'])]
    #[Serializer\SerializedName('id')]
    public function getId(): ?int
    {
        return $this->id;
    }

    #[Serializer\Groups(['short', 'long'])]
    #[Serializer\SerializedName('email')]
    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): static
    {
        $this->email = $email;

        return $this;
    }

    #[Serializer\Groups(['short', 'long'])]
    #[Serializer\SerializedName('username')]
    public function getUsername(): ?string
    {
        return $this->username;
    }

    public function setUsername(string $username): static
    {
        $this->username = $username;

        return $this;
    }

    #[Serializer\Groups(['short', 'long'])]
    #[Serializer\SerializedName('image_url')]
    public function getImageUrl(): ?string
    {
        return $this->imageUrl;
    }

    public function setImageUrl(?string $imageUrl): static
    {
        $this->imageUrl = $imageUrl;

        return $this;
    }

    #[Serializer\Ignore]
    public function getUserIdentifier(): string
    {
        return $this->email;
    }

    #[Serializer\Ignore]
    public function getRoles(): array
    {
        return ['ROLE_USER'];
    }

    #[Serializer\Ignore]
    public function eraseCredentials(): void
    {
    }

    #[Serializer\Groups(['short', 'long'])]
    #[Serializer\SerializedName('is_system')]
    public function isSystem(): bool
    {
        return $this->getEmail() === static::SYSTEM_EMAIL;
    }

    #[Serializer\Groups(['short', 'long'])]
    #[Serializer\SerializedName('formatted_name')]
    public function getFormattedName(): ?string
    {
        if ($this->isSystem()) {
            return null;
        } else {
            return \sprintf('%s (%s)', $this->username, $this->email);
        }
    }
}
