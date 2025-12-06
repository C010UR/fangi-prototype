<?php

declare(strict_types=1);

namespace App\OpenApi\Attribute;

use Attribute;

#[Attribute(Attribute::TARGET_METHOD)]
class UnauthorizedResponse extends ErrorResponse
{
    public function __construct(
        ?string $description = null,
        ?string $message = null,
        ?string $ref = null,
    ) {
        parent::__construct(401, $description, $message, $ref);
    }
}
