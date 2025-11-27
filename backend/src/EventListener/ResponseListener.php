<?php

declare(strict_types=1);

namespace App\EventListener;

use App\Service\ResponseService;
use App\Util\Environment;
use Symfony\Component\EventDispatcher\Attribute\AsEventListener;
use Symfony\Component\HttpKernel\Event\ResponseEvent;

class ResponseListener
{
    public const array HEADERS = [
        'Content-Security-Policy' => 'default-src \'none\'; frame-ancestors \'none\';',
        'Strict-Transport-Security' => 'max-age=31536000; includeSubDomains; preload',
        'X-Content-Type-Options' => 'nosniff',
        'Referrer-Policy' => 'no-referrer',
    ];

    public const array HEADERS_DEV = [
        'Content-Security-Policy' => 'frame-ancestors \'none\';',
        'Strict-Transport-Security' => 'max-age=31536000; includeSubDomains; preload',
        'X-Content-Type-Options' => 'nosniff',
        'Referrer-Policy' => 'no-referrer',
    ];

    public function __construct(
        private ResponseService $responseService,
    ) {
    }

    #[AsEventListener(event: 'kernel.response', priority: -2000)]
    public function onKernelResponse(ResponseEvent $event): void
    {
        if (!$event->isMainRequest()) {
            return;
        }

        $response = $event->getResponse();

        $headers = Environment::isDev() ? self::HEADERS_DEV : self::HEADERS;
        foreach ($headers as $header => $value) {
            $response->headers->set($header, $value);
        }
    }
}
