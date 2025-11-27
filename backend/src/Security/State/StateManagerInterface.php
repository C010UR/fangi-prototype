<?php

declare(strict_types=1);

namespace App\Security\State;

use SensitiveParameter;

interface StateManagerInterface
{
    public function generateKey(): string;

    public function isUserKeyValid(#[SensitiveParameter]string $key): bool;

    public function get(#[SensitiveParameter]string $key): mixed;

    public function set(#[SensitiveParameter]string $key, mixed $data): bool;

    public function destroy(#[SensitiveParameter]string $key): bool;
}
