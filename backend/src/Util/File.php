<?php

declare(strict_types=1);

namespace App\Util;

class File
{
    public static function validatePath(string $path): bool
    {
        if (!str_starts_with($path, '/')) {
            return false;
        }

        $invalidChars = ['<', '>', '"', '|', '?', '*', ':', '\\', '?'];
        foreach ($invalidChars as $char) {
            if (str_contains($path, $char)) {
                return false;
            }
        }

        $reservedNames = [
            'CON',
            'PRN',
            'AUX',
            'NUL',
            'COM1',
            'COM2',
            'COM3',
            'COM4',
            'COM5',
            'COM6',
            'COM7',
            'COM8',
            'COM9',
            'LPT1',
            'LPT2',
            'LPT3',
            'LPT4',
            'LPT5',
            'LPT6',
            'LPT7',
            'LPT8',
            'LPT9',
        ];

        $pathParts = explode('/', $path);
        foreach ($pathParts as $part) {
            if (empty($part)) {
                continue;
            }

            $nameWithoutExt = pathinfo($part, \PATHINFO_FILENAME);

            if (\in_array(strtoupper($nameWithoutExt), $reservedNames, true)) {
                return false;
            }
        }

        if (preg_match('/[\x00-\x08\x0B\x0C\x0E-\x1F]/', $path)) {
            return false;
        }

        if (\strlen($path) > 4096) {
            return false;
        }

        foreach ($pathParts as $part) {
            if (\strlen($part) > 255) {
                return false;
            }
        }

        if (str_contains($path, '..')) {
            return false;
        }

        if (preg_match('/\/+/', $path)) {
            return false;
        }

        return true;
    }
}
