<?php

declare(strict_types=1);

namespace App\Security\Exception;

use Exception;
use Symfony\Component\HttpKernel\Attribute\WithHttpStatus;
use Throwable;

#[WithHttpStatus(401)]
class UserBannedException extends Exception
{
    public function __construct(
        string $message = 'security.credentials.banned',
        int $code = 0,
        ?Throwable $previous = null,
    ) {
        parent::__construct($message, $code, $previous);
    }
}
