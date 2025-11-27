<?php

declare(strict_types=1);

namespace App\Security\AccountRegistration\Exception;

use Exception;
use Symfony\Component\HttpKernel\Attribute\WithHttpStatus;
use Throwable;

#[WithHttpStatus(400)]
class InvalidAccountRegistrationTokenException extends Exception implements AccountRegistrationExceptionInterface
{
    public function __construct(
        string $message = 'security.account_registration.invalid',
        int $code = 0,
        ?Throwable $previous = null,
    ) {
        parent::__construct($message, $code, $previous);
    }
}
