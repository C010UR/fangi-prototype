<?php

declare(strict_types=1);

namespace App\Model\MFA;

use DateTimeImmutable;

interface MFAMethodInterface
{
    public function getRecipient(): ?string;

    public function getAuthCode(): ?string;

    public function setAuthCode(?string $code): static;

    public function getLastCodeSentAt(): ?DateTimeImmutable;

    public function setLastCodeSentAt(?DateTimeImmutable $lastCodeSentAt): static;

    public function getLastCodeExpiresAt(): ?DateTimeImmutable;

    public function setLastCodeExpiresAt(?DateTimeImmutable $lastCodeExpiresAt): static;
}
