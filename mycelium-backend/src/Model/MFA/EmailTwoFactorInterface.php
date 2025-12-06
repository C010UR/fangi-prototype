<?php

declare(strict_types=1);

namespace App\Model\MFA;

use Symfony\Component\Serializer\Attribute as Serializer;

interface EmailTwoFactorInterface
{
    public function getName(): ?string;

    #[Serializer\Ignore]
    public function isEmailMFAEnabled(): bool;

    #[Serializer\Ignore]
    public function getEmailMFA(): ?MFAMethodInterface;
}
