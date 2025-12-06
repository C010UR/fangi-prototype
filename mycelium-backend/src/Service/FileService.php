<?php

declare(strict_types=1);

namespace App\Service;

use App\Util\ImageOptimizer;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpFoundation\File\UploadedFile;

class FileService
{
    private ImageOptimizer $imageOptimizer;

    public function __construct(
        #[Autowire(param: 'kernel.project_dir')]
        private string $projectDir,
    ) {
        $this->imageOptimizer = new ImageOptimizer();
    }

    public function upload(UploadedFile $file): string
    {

        if ($this->imageOptimizer->isImage($file->getMimeType())) {
            $this->imageOptimizer->optimize($file->getPathname());
            $format = 'webp';
        } else {
            $format = $file->guessExtension() ?? ($file->getClientOriginalExtension() ?: 'bin');
        }

        $filename = \sprintf(
            '%s.%s',
            bin2hex(random_bytes(16)),
            $format,
        );
        $file = $file->move(
            \sprintf('%s/public/uploads', $this->projectDir),
            $filename,
        );

        return \sprintf('/uploads/%s', $filename);
    }
}
