<?php

declare(strict_types=1);

namespace App\Enum;

readonly class UserRole
{
    public const string USER = 'ROLE_USER';
    public const string ADMIN = 'ROLE_ADMIN';
    public const string PUBLIC = 'PUBLIC_ACCESS';
}
