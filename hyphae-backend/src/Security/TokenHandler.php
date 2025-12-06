<?php

declare(strict_types=1);

namespace App\Security;

use App\Repository\SessionRepository;
use App\Service\OAuthClient;
use DateTimeImmutable;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Security\Core\Exception\BadCredentialsException;
use Symfony\Component\Security\Http\AccessToken\AccessTokenHandlerInterface;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\UserBadge;
use Symfony\Component\Uid\Uuid;
use Throwable;

class TokenHandler implements AccessTokenHandlerInterface
{
    public function __construct(
        private SessionRepository $sessionRepository,
        private OAuthClient $oauthClient,
        private EntityManagerInterface $entityManager,
    ) {
    }

    public function getUserBadgeFrom(string $accessToken): UserBadge
    {
        try {
            $uuid = Uuid::fromRfc4122($accessToken);
        } catch (Throwable $e) {
            throw new BadCredentialsException('Invalid access token');
        }

        $session = $this->sessionRepository->findOneById($uuid);

        if (null === $session) {
            throw new BadCredentialsException('Invalid access token');
        }

        if ($session->getExpiresAt() < new DateTimeImmutable()) {
            try {
                $this->oauthClient->refreshSession($session);
                $this->entityManager->flush();
            } catch (Throwable $e) {
                throw new BadCredentialsException('Session expired');
            }
        }

        return new UserBadge($session->getId()->toRfc4122(), fn() => $session);
    }
}
