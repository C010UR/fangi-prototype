<?php

declare(strict_types=1);

namespace App\EventListener;

use App\Service\ResponseService;
use Symfony\Component\EventDispatcher\Attribute\AsEventListener;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Http\Event\LoginFailureEvent;

class LoginListener
{
    public function __construct(
        private ResponseService $responseService,
    ) {
    }

    #[AsEventListener(LoginFailureEvent::class)]
    public function onLoginFailure(LoginFailureEvent $event): void
    {
        $event->setResponse($this->responseService->message($event->getException()->getMessage(), status: Response::HTTP_UNAUTHORIZED));
    }
}
