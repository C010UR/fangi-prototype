<?php

declare(strict_types=1);

namespace App\OpenApi\Attribute;

use Attribute;
use OpenApi\Attributes as OA;

#[Attribute(Attribute::TARGET_METHOD | Attribute::IS_REPEATABLE)]
class BinaryFileResponse extends OA\Response
{
    public const string TYPE_SPREADSHEET = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    public const string TYPE_PDF = 'application/pdf';

    public function __construct(
        int $response,
        string $description,
        string $type = self::TYPE_SPREADSHEET,
    ) {
        parent::__construct(
            response: $response,
            description: $description,
            content: new OA\MediaType(
                mediaType: $type,
                schema: new OA\Schema(type: 'string', format: 'binary'),
            ),
        );
    }
}
