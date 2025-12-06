<?php

declare(strict_types=1);

namespace App\Security\PasswordReset\Exception;

use Exception;
use Symfony\Component\HttpKernel\Attribute\WithHttpStatus;
use Throwable;

#[WithHttpStatus(400)]
class ExpiredPasswordResetTokenException extends Exception implements AccountRegistrationExceptionInterface
{
    public function __construct(
        string $message = 'security.password_reset.expired',
        int $code = 0,
        ?Throwable $previous = null,
    ) {
        parent::__construct($message, $code, $previous);
    }
}
