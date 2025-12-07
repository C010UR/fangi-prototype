<?php

declare(strict_types=1);

namespace App\Util;

class TokenUtils
{
    public static function generateToken(): string
    {
        return bin2hex(random_bytes(128));
    }

    public static function hash(string $data): string
    {
        return hash('sha256', $data);
    }
}
