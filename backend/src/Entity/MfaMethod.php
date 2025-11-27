<?php

declare(strict_types=1);

namespace App\Entity;

use App\Entity\Trait\TimestampableEntityTrait;
use App\Enum\MfaType;
use App\Model\MFA\MFAMethodInterface;
use App\Repository\MfaMethodRepository;
use App\Serializer\Interface\DepthAwareNormalizableInterface;
use App\Util\StringHelper;
use DateTimeImmutable;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute as Serializer;

#[ORM\Entity(repositoryClass: MfaMethodRepository::class)]
#[ORM\HasLifecycleCallbacks]
class MfaMethod implements MFAMethodInterface, DepthAwareNormalizableInterface
{
    use TimestampableEntityTrait;

    #[ORM\Id]
    #[ORM\GeneratedValue('SEQUENCE')]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $method = null;

    #[ORM\Column(length: 255)]
    private ?string $recipient = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $authCode = null;

    #[ORM\ManyToOne(inversedBy: 'mfaMethods')]
    #[ORM\JoinColumn(name: 'user_id', nullable: false)]
    private ?User $user = null;

    #[ORM\Column]
    private ?int $priority = 0;

    #[ORM\Column(nullable: true)]
    private ?DateTimeImmutable $lastCodeSentAt = null;

    #[ORM\Column(nullable: true)]
    private ?DateTimeImmutable $lastCodeExpiresAt = null;

    #[Serializer\Ignore]
    public function getId(): ?int
    {
        return $this->id;
    }

    #[Serializer\Groups(['short', 'long'])]
    #[Serializer\SerializedName('method')]
    public function getMethod(): ?string
    {
        return $this->method;
    }

    public function setMethod(string $method): static
    {
        $this->method = $method;

        return $this;
    }

    #[Serializer\Groups(['short', 'long'])]
    #[Serializer\SerializedName('recipient')]
    public function getObscuredRecipient(): ?string
    {
        switch ($this->getMethod()) {
            case MfaType::Email->value:
                return StringHelper::obscureEmail($this->getRecipient());
            default:
                return $this->getRecipient();
        }
    }

    #[Serializer\Ignore]
    public function getRecipient(): ?string
    {
        return $this->recipient;
    }

    public function setRecipient(string $recipient): static
    {
        $this->recipient = $recipient;

        return $this;
    }

    #[Serializer\Ignore]
    public function getAuthCode(): ?string
    {
        return $this->authCode;
    }

    public function setAuthCode(?string $authCode): static
    {
        $this->authCode = $authCode;

        return $this;
    }

    #[Serializer\Ignore]
    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): static
    {
        $this->user = $user;

        return $this;
    }

    #[Serializer\Ignore]
    public function getPriority(): ?int
    {
        return $this->priority;
    }

    public function setPriority(int $priority): static
    {
        $this->priority = $priority;

        return $this;
    }

    #[Serializer\Ignore]
    public function getLastCodeSentAt(): ?DateTimeImmutable
    {
        return $this->lastCodeSentAt;
    }

    public function setLastCodeSentAt(?DateTimeImmutable $lastCodeSentAt): static
    {
        $this->lastCodeSentAt = $lastCodeSentAt;

        return $this;
    }

    #[Serializer\Ignore]
    public function getLastCodeExpiresAt(): ?DateTimeImmutable
    {
        return $this->lastCodeExpiresAt;
    }

    public function setLastCodeExpiresAt(?DateTimeImmutable $lastCodeExpiresAt): static
    {
        $this->lastCodeExpiresAt = $lastCodeExpiresAt;

        return $this;
    }
}
