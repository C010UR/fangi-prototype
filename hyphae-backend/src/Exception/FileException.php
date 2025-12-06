<?php

declare(strict_types=1);

namespace App\Exception;

use Exception;
use Symfony\Component\HttpKernel\Attribute\WithHttpStatus;
use Throwable;

#[WithHttpStatus(400)]
class FileException extends Exception
{
    public function __construct(string $message = 'File error', int $code = 500, ?Throwable $previous = null)
    {
        parent::__construct($message, $code, $previous);
    }
}
