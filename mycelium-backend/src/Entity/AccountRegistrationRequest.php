<?php

declare(strict_types=1);

namespace App\Entity;

use App\Entity\Trait\TimestampableEntityTrait;
use App\Repository\AccountRegistrationRequestRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: AccountRegistrationRequestRepository::class)]
#[ORM\UniqueConstraint(name: 'UNIQ_IDENTIFIER_ACCOUNT_REGISTRATION_REQUEST_SELECTOR', fields: ['selector'])]
#[ORM\HasLifecycleCallbacks]
class AccountRegistrationRequest
{
    use TimestampableEntityTrait;

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $user = null;

    #[ORM\Column(length: 20)]
    private ?string $selector = null;

    #[ORM\Column(length: 100)]
    private ?string $token = null;

    public function getId(): ?int
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
}
