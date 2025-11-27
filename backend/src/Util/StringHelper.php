<?php

declare(strict_types=1);

namespace App\Util;

use InvalidArgumentException;
use RuntimeException;

class StringHelper
{
    /**
     * @param array<string, string> $required
     * @param array<string, string> $optional
     */
    public static function replace(string $string, array $required = [], array $optional = []): string
    {
        $replaces = [];
        $values = [];

        $map = function (string $replace, string $value): array {
            if (
                !\is_string($value)
                && !\is_scalar($value)
                && !(\is_object($value) && method_exists($value, '__toString'))
            ) {
                throw new InvalidArgumentException('Replace value is not a string.');
            }

            return ['{' . $replace . '}', (string)$value];
        };

        foreach ($required as $replace => $value) {
            [$replace, $value] = $map($replace, $value);
            $replaces[] = $replace;
            $values[] = $value;

            if (!str_contains($string, $replace)) {
                throw new RuntimeException(\sprintf('String does not contain a required parameter "%s"', $replace));
            }
        }

        foreach ($optional as $replace => $value) {
            [$replace, $value] = $map($replace, $value);
            $replaces[] = $replace;
            $values[] = $value;

            if (\array_key_exists($replace, $required)) {
                throw new InvalidArgumentException(\sprintf('Duplicate key "%s"', $replace));
            }
        }

        return str_replace($replaces, $values, $string);
    }

    public static function key(string $string): string
    {
        $string = strtolower($string);
        $string = preg_replace('/[^a-z0-9_]/', '', $string);

        return $string;
    }

    public static function slug(string|array $slug): string
    {
        if (!\is_array($slug)) {
            $slug = [$slug];
        }

        $slug = array_map(function (string $string) {
            $string = strtolower($string);
            $string = preg_replace('/\s+/', '-', $string);
            $string = preg_replace('/[^a-z0-9-]/', '', $string);

            return $string;
        }, $slug);

        return implode('-', $slug);
    }

    public static function obscureEmail(string $email): string
    {
        $parts = explode('@', $email);

        if (2 !== \count($parts)) {
            return $email;
        }

        $username = $parts[0];
        $domain = $parts[1];

        if (\strlen($username) <= 3) {
            $obscuredUsername = str_repeat('*', \strlen($username));
        } else {
            $obscuredUsername = $username[0] . $username[1] . str_repeat('*', \strlen($username) - 3) . substr($username, -1);
        }

        $domainParts = explode('.', $domain);
        $obscuredDomain = $domainParts[0][0] . str_repeat('*', \strlen($domainParts[0]) - 1);

        if (\count($domainParts) > 1) {
            $obscuredDomain .= '.' . end($domainParts);
        }

        return $obscuredUsername . '@' . $obscuredDomain;
    }
}
