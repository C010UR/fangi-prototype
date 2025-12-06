<?php

declare(strict_types=1);

namespace App\Entity;

use App\Entity\Trait\TimestampableEntityTrait;
use App\Repository\AuthorizationCodeRepository;
use DateTimeImmutable;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: AuthorizationCodeRepository::class)]
#[ORM\HasLifecycleCallbacks]
class AuthorizationCode
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

    #[ORM\Column(type: Types::JSON)]
    private array $scopes = [];

    #[ORM\Column(type: Types::TEXT)]
    private ?string $state = null;

    #[ORM\Column(length: 255)]
    private ?string $nonce = null;

    #[ORM\Column(type: Types::TEXT)]
    private ?string $redirectUri = null;

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

    public function getState(): ?string
    {
        return $this->state;
    }

    public function setState(string $state): static
    {
        $this->state = $state;

        return $this;
    }

    public function getNonce(): ?string
    {
        return $this->nonce;
    }

    public function setNonce(string $nonce): static
    {
        $this->nonce = $nonce;

        return $this;
    }

    public function getRedirectUri(): ?string
    {
        return $this->redirectUri;
    }

    public function setRedirectUri(string $redirectUri): static
    {
        $this->redirectUri = $redirectUri;

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
