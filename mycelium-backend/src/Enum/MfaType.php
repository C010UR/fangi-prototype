<?php

declare(strict_types=1);

namespace App\Enum;

use InvalidArgumentException;

enum MfaType: string
{
    case Email = 'email';

    public static function toFullName(string|self $type): string
    {
        if (\is_string($type)) {
            $type = self::from($type);
        }

        return \sprintf('mycelium_%s_mfa_provider', $type->value);
    }

    public static function fromFullName(string $type): self
    {
        $pattern = '/^mycelium_(.+)_mfa_provider$/';

        if (preg_match($pattern, $type, $matches)) {
            return self::from($matches[1]);
        }

        throw new InvalidArgumentException("Invalid full name format: {$type}");
    }
}
