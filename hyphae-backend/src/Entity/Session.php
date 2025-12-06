<?php

declare(strict_types=1);

namespace App\Entity;

use App\Entity\Trait\TimestampableEntityTrait;
use App\Repository\SessionRepository;
use DateTimeImmutable;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Uid\Uuid;

#[ORM\Entity(repositoryClass: SessionRepository::class)]
#[ORM\HasLifecycleCallbacks]
class Session implements UserInterface
{
    use TimestampableEntityTrait;

    #[ORM\Id]
    #[ORM\Column(type: 'uuid')]
    private ?Uuid $id = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $user = null;

    #[ORM\Column(type: Types::JSON)]
    private array $accessToken = [];

    #[ORM\Column(type: Types::JSON)]
    private array $idToken = [];

    #[ORM\Column(type: Types::JSON)]
    private array $refreshToken = [];

    #[ORM\Column]
    private array $scopes = [];

    #[ORM\Column]
    private ?DateTimeImmutable $expiresAt = null;

    public function __construct()
    {
        $this->id = Uuid::v7();
    }

    public function getId(): ?Uuid
    {
        return $this->id;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): static
    {
        $this->user = $user;

        return $this;
    }

    public function getAccessToken(): ?array
    {
        return $this->accessToken;
    }

    public function setAccessToken(array $accessToken): static
    {
        $this->accessToken = $accessToken;

        return $this;
    }

    public function getIdToken(): ?array
    {
        return $this->idToken;
    }

    public function setIdToken(array $idToken): static
    {
        $this->idToken = $idToken;

        return $this;
    }

    public function getRefreshToken(): ?array
    {
        return $this->refreshToken;
    }

    public function setRefreshToken(array $refreshToken): static
    {
        $this->refreshToken = $refreshToken;

        return $this;
    }

    public function getScopes(): array
    {
        return $this->scopes;
    }

    public function setScopes(array $scopes): static
    {
        $this->scopes = $scopes;

        return $this;
    }

    public function getExpiresAt(): ?DateTimeImmutable
    {
        return $this->expiresAt;
    }

    public function setExpiresAt(DateTimeImmutable $expiresAt): static
    {
        $this->expiresAt = $expiresAt;

        return $this;
    }

    public function getUserIdentifier(): string
    {
        return $this->getUser()->getUserIdentifier();
    }

    public function getRoles(): array
    {
        return $this->getUser()->getRoles();
    }

    public function eraseCredentials(): void
    {
    }
}
