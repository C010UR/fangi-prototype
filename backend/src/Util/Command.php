<?php

declare(strict_types=1);

namespace App\Util;

use RuntimeException;

class Command
{
    public static function getTempFilename(string $prefix = 'wl'): string
    {
        return tempnam(sys_get_temp_dir(), $prefix);
    }

    public static function run(string $command, array $args = []): void
    {
        $preCommand = $command;

        foreach ($args as $name => $arg) {
            $command = str_replace('{' . $name . '}', escapeshellarg((string)$arg), $command);
        }

        exec($command, $output, $returnVar);

        if (0 !== $returnVar) {
            throw new RuntimeException(\sprintf('Command "%s" failed with exit code %d', $preCommand, $returnVar));
        }
    }
}
