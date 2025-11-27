<?php

declare(strict_types=1);

namespace App\Service\Exception;

use Symfony\Component\HttpKernel\Attribute\WithHttpStatus;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Throwable;

#[WithHttpStatus(400)]
class FormException extends HttpException
{
    public function __construct(string $message = 'Form validation failed', int $code = 400, ?Throwable $previous = null, array $headers = [])
    {
        parent::__construct($code, $message, $previous, $headers);
    }
}
