<?php

declare(strict_types=1);

namespace App\Security\PasswordReset\Exception;

use Exception;
use Symfony\Component\HttpKernel\Attribute\WithHttpStatus;
use Throwable;

#[WithHttpStatus(400)]
class InvalidPasswordResetTokenException extends Exception implements AccountRegistrationExceptionInterface
{
    public function __construct(
        string $message = 'security.password_reset.invalid',
        int $code = 0,
        ?Throwable $previous = null,
    ) {
        parent::__construct($message, $code, $previous);
    }
}
