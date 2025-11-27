<?php

declare(strict_types=1);

namespace App\Entity;

use App\Entity\Trait\TimestampableEntityTrait;
use App\Repository\PasswordResetRequestRepository;
use DateTimeImmutable;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: PasswordResetRequestRepository::class)]
#[ORM\UniqueConstraint(name: 'UNIQ_IDENTIFIER_PASSWORD_RESET_REQUEST_SELECTOR', fields: ['selector'])]
#[ORM\HasLifecycleCallbacks]
class PasswordResetRequest
{
    use TimestampableEntityTrait;

    #[ORM\Id]
    #[ORM\GeneratedValue('SEQUENCE')]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 20)]
    private ?string $selector = null;

    #[ORM\Column(length: 100)]
    private ?string $token = null;

    #[ORM\Column(nullable: true)]
    private ?DateTimeImmutable $expiresAt = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $user = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getSelector(): ?string
    {
        return $this->selector;
    }

    public function setSelector(string $selector): static
    {
        $this->selector = $selector;

        return $this;
    }

    public function getToken(): ?string
    {
        return $this->token;
    }

    public function setToken(string $token): static
    {
        $this->token = $token;

        return $this;
    }

    public function getExpiresAt(): ?DateTimeImmutable
    {
        return $this->expiresAt;
    }

    public function setExpiresAt(?DateTimeImmutable $expiresAt): static
    {
        $this->expiresAt = $expiresAt;

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
}
