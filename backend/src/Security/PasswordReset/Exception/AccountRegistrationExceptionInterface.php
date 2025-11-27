<?php

declare(strict_types=1);

namespace App\Security\PasswordReset\Exception;

use Symfony\Component\HttpKernel\Attribute\WithHttpStatus;

#[WithHttpStatus(400)]
interface AccountRegistrationExceptionInterface
{
}
