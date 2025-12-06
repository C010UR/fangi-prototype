<?php

declare(strict_types=1);

namespace App\EventListener;

use App\Service\ResponseService;
use Symfony\Component\EventDispatcher\Attribute\AsEventListener;
use Symfony\Component\Security\Http\Event\LogoutEvent;

class LogoutListener
{
    public function __construct(
        private ResponseService $responseService,
    ) {
    }

    #[AsEventListener(LogoutEvent::class)]
    public function onLogout(LogoutEvent $event): void
    {
        $event->setResponse($this->responseService->message('security.credentials.logout'));
    }
}
