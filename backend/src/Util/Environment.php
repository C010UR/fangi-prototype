<?php

declare(strict_types=1);

namespace App\Util;

class Environment
{
    public static function isDev(): bool
    {
        return ($_ENV['APP_ENV'] ?? 'prod') === 'dev';
    }

    public static function isStage(): bool
    {
        return ($_ENV['APP_ENV'] ?? 'prod') === 'stage';
    }

    public static function isProd(): bool
    {
        return !\in_array($_ENV['APP_ENV'] ?? 'prod', ['dev', 'stage'], true);
    }
}
