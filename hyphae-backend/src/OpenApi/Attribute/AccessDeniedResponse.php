<?php

declare(strict_types=1);

namespace App\OpenApi\Attribute;

use Attribute;

#[Attribute(Attribute::TARGET_METHOD)]
class AccessDeniedResponse extends ErrorResponse
{
    public array $roles;

    public function __construct(
        string|array|null $roles = null,
        ?string $description = null,
        ?string $message = null,
        ?string $ref = null,
    ) {
        if (null === $roles || empty($roles)) {
            $this->roles = ['PUBLIC_ACCESS'];
        } elseif (\is_string($roles)) {
            $this->roles = [$roles];
        } else {
            $this->roles = $roles;
        }

        parent::__construct(403, $description, $message, $ref);
    }
}
