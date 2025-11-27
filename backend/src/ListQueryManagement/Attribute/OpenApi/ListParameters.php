<?php

declare(strict_types=1);

namespace App\ListQueryManagement\Attribute\OpenApi;

use Attribute;
use OpenApi\Attributes as OA;

#[Attribute(Attribute::TARGET_METHOD | Attribute::IS_REPEATABLE)]
class ListParameters extends OA\Parameter
{
    public function __construct(private string $className)
    {
        parent::__construct(parameter: $className, name: $className, in: 'query');
    }

    public function getClassName(): string
    {
        return $this->className;
    }
}
