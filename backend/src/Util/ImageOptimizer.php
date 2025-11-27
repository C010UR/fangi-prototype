<?php

declare(strict_types=1);

namespace App\Util;

use Imagine\Gd\Imagine;
use Imagine\Image\Box;

class ImageOptimizer
{
    private const MAX_WIDTH = 1000;
    private const MAX_HEIGHT = 1000;

    private $imagine;

    public function __construct()
    {
        $this->imagine = new Imagine();
    }

    public function isImage(string $mimeType): bool
    {
        return \in_array($mimeType, [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'image/svg+xml',
            'image/avif',
            'image/heic',
            'image/heif',
            'image/heif-sequence',
        ], true);
    }

    /**
     * Resizes and converts image to webp format.
     */
    public function optimize(string $filename): void
    {
        [$iwidth, $iheight] = getimagesize($filename);
        $ratio = $iwidth / $iheight;
        $width = self::MAX_WIDTH;
        $height = self::MAX_HEIGHT;
        if ($width / $height > $ratio) {
            $width = $height * $ratio;
        } else {
            $height = $width / $ratio;
        }

        $photo = $this->imagine->open($filename);
        $photo->resize(new Box($width, $height))->save($filename, ['format' => 'webp']);
    }
}
