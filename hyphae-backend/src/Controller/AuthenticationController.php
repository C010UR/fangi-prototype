<?php

declare(strict_types=1);

namespace App\Controller;

use App\Controller\Abstract\ExtendedAbstractController;
use LogicException;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/v1', name: 'api_v1_auth_')]
final class AuthenticationController extends ExtendedAbstractController
{
    #[Route('/login', name: 'login', methods: ['POST'])]
    public function login(): JsonResponse
    {
        /*
         * @see App\Security\AuthenticationHandler
         */
        throw new LogicException('This method should be unreachable');
    }

    #[Route('/logout', name: 'logout', methods: ['GET'])]
    public function logout(): JsonResponse
    {
        /*
         * @see App\EventListener\LogoutListener
         */
        throw new LogicException('This method should be unreachable');
    }
}
