<?php

declare(strict_types=1);

namespace App\Security;

use App\Service\ResponseService;
use Doctrine\ORM\EntityManagerInterface;
use Scheb\TwoFactorBundle\Security\Http\Authentication\AuthenticationRequiredHandlerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Http\Authentication\AuthenticationFailureHandlerInterface;

class MFAAuthenticationHandler implements
    AuthenticationFailureHandlerInterface,
    AuthenticationRequiredHandlerInterface
{
    public function __construct(
        private ResponseService $response,
        private EntityManagerInterface $entityManager,
    ) {
    }

    public function onAuthenticationFailure(Request $request, AuthenticationException $exception): Response
    {
        return $this->response->message($exception->getMessage(), Response::HTTP_UNAUTHORIZED);
    }

    public function onAuthenticationRequired(Request $request, TokenInterface $token): Response
    {
        return $this->response->message('security.mfa.access_denied', Response::HTTP_FORBIDDEN);
    }
}
