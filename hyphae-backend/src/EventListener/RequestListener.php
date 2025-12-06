<?php

declare(strict_types=1);

namespace App\EventListener;

use App\Service\FileService;
use Symfony\Component\EventDispatcher\Attribute\AsEventListener;
use Symfony\Component\HttpKernel\Event\RequestEvent;

class RequestListener
{
    public function __construct(
        private FileService $fileService,
    ) {
    }

    #[AsEventListener(event: 'kernel.request', priority: 10000)]
    public function onKernelRequest(RequestEvent $event): void
    {
        $this->fileService->initializeFolder();
    }
}
