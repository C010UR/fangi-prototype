<?php

declare(strict_types=1);

namespace App\Security;

use App\Entity\Session;
use App\Service\OAuthClient;
use DateTimeInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Http\Authenticator\AbstractAuthenticator;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\UserBadge;
use Symfony\Component\Security\Http\Authenticator\Passport\Passport;
use Symfony\Component\Security\Http\Authenticator\Passport\SelfValidatingPassport;

class FederatedAuthenticator extends AbstractAuthenticator
{
    public function __construct(
        private OAuthClient $oauthClient,
    ) {
    }

    public function supports(Request $request): ?bool
    {
        return $request->query->has('code');
    }

    public function authenticate(Request $request): Passport
    {
        $code = $request->query->getString('code');
        $nonce = $request->query->getString('nonce');

        $session = $this->oauthClient->authenticate($code, $nonce ?: null);

        return new SelfValidatingPassport(
            new UserBadge($session->getId()->toRfc4122(), fn() => $session),
        );
    }

    public function onAuthenticationSuccess(Request $request, TokenInterface $token, string $firewallName): ?Response
    {
        $session = $token->getUser();

        if (!$session instanceof Session) {
            return new JsonResponse(['error' => 'Invalid session'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        return new JsonResponse([
            'token' => $session->getId()->toRfc4122(),
            'user' => [
                'email' => $session->getUser()->getEmail(),
                'username' => $session->getUser()->getUsername(),
            ],
            'expires_at' => $session->getExpiresAt()->format(DateTimeInterface::ATOM),
        ]);
    }

    public function onAuthenticationFailure(Request $request, AuthenticationException $exception): ?Response
    {
        return new JsonResponse(['message' => $exception->getMessage()], Response::HTTP_UNAUTHORIZED);
    }
}
