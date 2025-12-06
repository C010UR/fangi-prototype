<?php

declare(strict_types=1);

namespace App\Security;

use App\Entity\User;
use App\Security\MFA\MFAHandler;
use App\Service\ResponseService;
use DateTimeImmutable;
use Doctrine\ORM\EntityManagerInterface;
use LogicException;
use Scheb\TwoFactorBundle\Security\Authentication\Token\TwoFactorTokenInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Http\Authentication\AuthenticationFailureHandlerInterface;
use Symfony\Component\Security\Http\Authentication\AuthenticationSuccessHandlerInterface;

class AuthenticationHandler implements
    AuthenticationSuccessHandlerInterface,
    AuthenticationFailureHandlerInterface
{
    public function __construct(
        private ResponseService $response,
        private EntityManagerInterface $entityManager,
        private MFAHandler $mfaHandler,
    ) {
    }

    public function onAuthenticationSuccess(Request $request, TokenInterface $token): Response
    {
        /** @var User $user */
        $user = $token->getUser();

        $user->setLastLoginAt(new DateTimeImmutable());
        $this->entityManager->persist($user);
        $this->entityManager->flush();

        $accessToken = $request->attributes->get('_security_access_token');

        if ($token instanceof TwoFactorTokenInterface) {
            $currentProvider = $token->getCurrentTwoFactorProvider();

            if (!$currentProvider) {
                throw new LogicException('User does have an MFA method.');
            }

            $this->mfaHandler->sendCode($token, $user->getMfaMethodByFullName($currentProvider)->getMethod());

            return $this->response->simpleData([
                'token' => $accessToken,
                'mfa_required' => true,
                'priority_mfa_method' => $user->getPriorityMfaMethod(),
                'available_mfa_methods' => $user->getMfaMethods(),
            ]);
        } else {
            return $this->response->simpleData([
                'token' => $accessToken,
                'mfa_required' => false,
                'priority_mfa_method' => null,
                'available_mfa_methods' => null,
            ]);
        }
    }

    public function onAuthenticationFailure(Request $request, AuthenticationException $exception): Response
    {
        return $this->response->message('Bad credentials.', Response::HTTP_UNAUTHORIZED);
    }
}
