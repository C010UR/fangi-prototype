<?php

declare(strict_types=1);

namespace App\Entity;

use App\Entity\Trait\TimestampableEntityTrait;
use App\Repository\AccessTokenRepository;
use DateTimeImmutable;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: AccessTokenRepository::class)]
#[ORM\HasLifecycleCallbacks]
class AccessToken
{
    use TimestampableEntityTrait;

    #[ORM\Id]
    #[ORM\Column(type: Types::TEXT)]
    private ?string $token = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $user = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    private ?Server $server = null;

    #[ORM\Column]
    private array $scopes = [];

    #[ORM\Column(length: 255)]
    private ?string $tokenType = null;

    #[ORM\Column]
    private array $audience = [];

    #[ORM\Column]
    private ?DateTimeImmutable $expiresAt = null;

    public function getToken(): ?string
    {
        return $this->token;
    }

    public function setToken(string $token): static
    {
        $this->token = $token;

        return $this;
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

    public function getServer(): ?Server
    {
        return $this->server;
    }

    public function setServer(?Server $server): static
    {
        $this->server = $server;

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

    public function getTokenType(): ?string
    {
        return $this->tokenType;
    }

    public function setTokenType(string $tokenType): static
    {
        $this->tokenType = $tokenType;

        return $this;
    }

    public function getAudience(): array
    {
        return $this->audience;
    }

    public function setAudience(array $audience): static
    {
        $this->audience = $audience;

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
}
