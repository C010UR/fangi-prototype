<?php

declare(strict_types=1);

namespace App\Exception\OAuth;

use Exception;
use Symfony\Component\HttpKernel\Attribute\WithHttpStatus;
use Throwable;

#[WithHttpStatus(400)]
class ServerUnavailableException extends Exception
{
    public function __construct(string $message = 'Server unavailable', int $code = 500, ?Throwable $previous = null)
    {
        parent::__construct($message, $code, $previous);
    }
}
