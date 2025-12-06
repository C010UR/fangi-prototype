<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\AccessToken;
use App\Entity\AuthorizationCode;
use App\Entity\IDToken;
use App\Entity\Module;
use App\Entity\RefreshToken;
use App\Entity\Server;
use App\Entity\User;
use App\Repository\AccessTokenRepository;
use App\Repository\AuthorizationCodeRepository;
use App\Repository\IDTokenRepository;
use App\Repository\ModuleRepository;
use App\Repository\RefreshTokenRepository;
use App\Repository\ServerRepository;
use DateTimeImmutable;
use Doctrine\ORM\EntityManagerInterface;
use Firebase\JWT\JWT;
use RuntimeException;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Uid\Uuid;
use Throwable;

class OAuthService
{
    public const string ISSUER = 'mycelium';

    public function __construct(
        private EntityManagerInterface $entityManager,
        #[Autowire(env: 'mycelium.jwt_secret')]
        private string $jwtSecret,
        #[Autowire(env: 'mycelium.jwt_algorithm')]
        private string $jwtAlgorithm,
        #[Autowire(env: 'mycelium.authorization_code_ttl')]
        private int $authorizationCodeTtl,
        #[Autowire(env: 'mycelium.access_token_ttl')]
        private int $accessTokenTtl,
        #[Autowire(env: 'mycelium.refresh_token_ttl')]
        private int $refreshTokenTtl,
        #[Autowire(env: 'mycelium.id_token_ttl')]
        private int $idTokenTtl,
        private ModuleRepository $moduleRepository,
        private ServerRepository $serverRepository,
        private AuthorizationCodeRepository $authorizationCodeRepository,
        private RefreshTokenRepository $refreshTokenRepository,
        private IDTokenRepository $idTokenRepository,
        private AccessTokenRepository $accessTokenRepository,
    ) {}

    public function findAndValidateModule(string $clientId, string $redirectUri): Module
    {
        $module = $this->moduleRepository->findOneByClientId(Uuid::fromString($clientId));

        if (null === $module) {
            throw new RuntimeException('Invalid client.');
        }

        if ($module->getUrls() && !\in_array($redirectUri, $module->getUrls(), true)) {
            throw new RuntimeException('Invalid redirect URI.');
        }

        return $module;
    }

    private function findAndValidateAuthorizationCode(string $token): ?AuthorizationCode
    {
        $authorizationCode = $this->authorizationCodeRepository->findOneByToken($token);

        if (null === $authorizationCode) {
            throw new RuntimeException('Invalid authorization code.');
        }

        if ($authorizationCode->getExpiresAt() < new DateTimeImmutable()) {
            throw new RuntimeException('Authorization code expired.');
        }

        return $authorizationCode;
    }

    public function findAndValidateServer(string $clientId, string $secret, string $redirectUri): Server
    {
        $server = $this->serverRepository->findOneByClientId(Uuid::fromString($clientId));

        if (null === $server) {
            throw new RuntimeException('Invalid client.');
        }

        if (!$server->validateSecret($secret)) {
            throw new RuntimeException('Invalid secret.');
        }

        if ($server->getUrls() && !\in_array($redirectUri, $server->getUrls(), true)) {
            throw new RuntimeException('Invalid redirect URI.');
        }

        return $server;
    }

    public function validateAuthorizationCode(AuthorizationCode $authorizationCode, Server $server, string $redirectUri): void
    {
        if ($authorizationCode->getServer()->getId() !== $server->getId()) {
            throw new RuntimeException('Invalid client.');
        }

        if ($authorizationCode->getRedirectUri() !== $redirectUri) {
            throw new RuntimeException('Invalid redirect URI.');
        }
    }

    private function findAndValidateRefreshToken(string $token): RefreshToken
    {
        $refreshToken = $this->refreshTokenRepository->findOneByToken($token);

        if (null === $refreshToken) {
            throw new RuntimeException('Invalid refresh token.');
        }

        if ($refreshToken->getExpiresAt() < new DateTimeImmutable()) {
            throw new RuntimeException('Refresh token expired.');
        }

        return $refreshToken;
    }

    public function createAuthorizationCode(
        User $user,
        Server $server,
        array $scopes = [],
        string $state = '',
        string $nonce = '',
        string $redirectUri = '',
    ): string {
        $now = new DateTimeImmutable();
        $expiresAt = $now->modify('+' . $this->authorizationCodeTtl . ' seconds');

        $payload = [
            'sub' => (string)$user->getId(),
            'iss' => self::ISSUER,
            'aud' => $server->getClientId()?->toRfc4122(),
            'iat' => $now->getTimestamp(),
            'exp' => $expiresAt->getTimestamp(),
            'scopes' => $scopes,
            'nonce' => $nonce,
        ];

        $token = JWT::encode($payload, $this->jwtSecret, $this->jwtAlgorithm);

        $authorizationCode = new AuthorizationCode()
            ->setToken($token)
            ->setUser($user)
            ->setServer($server)
            ->setScopes($scopes)
            ->setState($state)
            ->setNonce($nonce)
            ->setRedirectUri($redirectUri)
            ->setExpiresAt($expiresAt);

        $this->entityManager->persist($authorizationCode);

        return $token;
    }

    public function exchangeAuthorizationCode(AuthorizationCode $authorizationCode): array
    {
        $user = $authorizationCode->getUser();
        $scopes = $authorizationCode->getScopes();
        $now = new DateTimeImmutable();

        $accessToken = $this->createAccessToken($user, $authorizationCode->getServer(), $scopes, $now);
        $refreshToken = $this->createRefreshToken($user, $authorizationCode->getServer(), $scopes, $now);
        $idToken = $this->createIDToken($user, $authorizationCode->getServer(), $authorizationCode->getNonce(), $now);

        $this->entityManager->remove($authorizationCode);

        return [
            'access_token' => $accessToken->getToken(),
            'refresh_token' => $refreshToken->getToken(),
            'id_token' => $idToken->getToken(),
            'token_type' => 'Bearer',
            'expires_in' => $this->accessTokenTtl,
        ];
    }

    private function createAccessToken(User $user, Server $server, array $scopes, DateTimeImmutable $now): AccessToken
    {
        $accessTokenExpiresAt = $now->modify('+' . $this->accessTokenTtl . ' seconds');
        $accessTokenPayload = [
            'sub' => (string)$user->getId(),
            'iss' => self::ISSUER,
            'aud' => ($clientId = $server->getClientId()) ? [$clientId->toRfc4122()] : [],
            'iat' => $now->getTimestamp(),
            'exp' => $accessTokenExpiresAt->getTimestamp(),
            'scopes' => $scopes,
            'type' => 'access_token',
        ];
        $accessTokenString = JWT::encode($accessTokenPayload, $this->jwtSecret, $this->jwtAlgorithm);

        $accessToken = new AccessToken()
            ->setToken($accessTokenString)
            ->setUser($user)
            ->setServer($server)
            ->setScopes($scopes)
            ->setTokenType('Bearer')
            ->setAudience($clientId ? [$clientId->toRfc4122()] : [])
            ->setExpiresAt($accessTokenExpiresAt);

        $this->entityManager->persist($accessToken);

        return $accessToken;
    }

    private function createRefreshToken(User $user, Server $server, array $scopes, DateTimeImmutable $now): RefreshToken
    {
        $refreshTokenExpiresAt = $now->modify('+' . $this->refreshTokenTtl . ' seconds');
        $refreshTokenPayload = [
            'sub' => (string)$user->getId(),
            'iss' => self::ISSUER,
            'aud' => ($clientId = $server->getClientId()) ? [$clientId->toRfc4122()] : [],
            'iat' => $now->getTimestamp(),
            'exp' => $refreshTokenExpiresAt->getTimestamp(),
            'scopes' => $scopes,
            'type' => 'refresh_token',
        ];
        $refreshTokenString = JWT::encode($refreshTokenPayload, $this->jwtSecret, $this->jwtAlgorithm);

        $refreshToken = new RefreshToken()
            ->setToken($refreshTokenString)
            ->setUser($user)
            ->setServer($server)
            ->setScopes($scopes)
            ->setExpiresAt($refreshTokenExpiresAt);

        $this->entityManager->persist($refreshToken);

        return $refreshToken;
    }

    private function createIDToken(User $user, Server $server, ?string $nonce, DateTimeImmutable $now): IDToken
    {
        $idTokenExpiresAt = $now->modify('+' . $this->idTokenTtl . ' seconds');
        $idTokenPayload = [
            'sub' => (string)$user->getId(),
            'iss' => self::ISSUER,
            'aud' => $server->getClientId()?->toRfc4122(),
            'iat' => $now->getTimestamp(),
            'exp' => $idTokenExpiresAt->getTimestamp(),
            'email' => $user->getEmail(),
            'preferred_username' => $user->getUsername(),
            'nonce' => $nonce,
        ];
        if ($user->getImageUrl()) {
            $idTokenPayload['picture'] = $user->getImageUrl();
        }

        $idTokenString = JWT::encode($idTokenPayload, $this->jwtSecret, $this->jwtAlgorithm);

        $idToken = new IDToken()
            ->setToken($idTokenString)
            ->setUser($user)
            ->setServer($server)
            ->setExpiresAt($idTokenExpiresAt);

        $this->entityManager->persist($idToken);

        return $idToken;
    }

    public function exchangeRefreshToken(RefreshToken $refreshToken): array
    {
        $user = $refreshToken->getUser();
        $server = $refreshToken->getServer();
        $scopes = $refreshToken->getScopes();
        $now = new DateTimeImmutable();

        $accessToken = $this->createAccessToken($user, $server, $scopes, $now);
        $newRefreshToken = $this->createRefreshToken($user, $server, $scopes, $now);
        $idToken = $this->createIDToken($user, $server, null, $now);

        $this->entityManager->remove($refreshToken);
        $this->entityManager->persist($accessToken);
        $this->entityManager->persist($newRefreshToken);
        $this->entityManager->persist($idToken);

        return [
            'access_token' => $accessToken->getToken(),
            'refresh_token' => $newRefreshToken->getToken(),
            'id_token' => $idToken->getToken(),
            'token_type' => 'Bearer',
            'expires_in' => $this->accessTokenTtl,
        ];
    }

    public function handleCreateAuthCodeRequest(Request $request, User $user): RedirectResponse
    {
        $clientId = $request->query->get('client_id');
        $redirectUri = $request->query->get('redirect_uri');
        $state = $request->query->get('state', '');
        $nonce = $request->query->get('nonce', '');

        if (!$clientId || !$redirectUri) {
            throw new RuntimeException('Missing parameter: client_id or redirect_uri');
        }

        try {
            $module = $this->findAndValidateModule($clientId, $redirectUri);
        } catch (Throwable $e) {
            $module = null;
        }

        if (null === $module) {
            throw new RuntimeException('Invalid client.');
        }

        if ($module->getUrls() && !\in_array($redirectUri, $module->getUrls(), true)) {
            throw new RuntimeException('Invalid redirect URI.');
        }

        $data = [/* form data */];
        $tokenString = $this->createAuthorizationCode($user, $data['server'], $data['scopes'], $state, $nonce, $redirectUri);

        $separator = (parse_url($redirectUri, PHP_URL_QUERY) == NULL) ? '?' : '&';
        $url = $redirectUri . $separator . 'code=' . $tokenString;
        if ($state) {
            $url .= '&state=' . $state;
        }

        return new RedirectResponse($url);
    }

    public function handleAuthCodeConsumptionRequest(Request $request): JsonResponse
    {
        $grantType = $request->get('grant_type');
        if ('authorization_code' !== $grantType) {
            throw new RuntimeException('Invalid grant_type.');
        }

        $code = $request->get('code');
        $redirectUri = $request->get('redirect_uri');
        $clientId = $request->get('client_id');
        $clientSecret = $request->get('client_secret');

        if (!$code || !$redirectUri || !$clientId || !$clientSecret) {
            throw new RuntimeException('Missing parameters.');
        }

        $server = $this->findAndValidateServer($clientId, $clientSecret, $redirectUri);
        $authorizationCode = $this->findAndValidateAuthorizationCode($code);

        $this->validateAuthorizationCode($authorizationCode, $server, $redirectUri);

        $response = $this->exchangeAuthorizationCode($authorizationCode);

        return new JsonResponse($response);
    }

    public function handleRefreshTokenConsumptionRequest(Request $request): JsonResponse
    {
        $grantType = $request->get('grant_type');
        if ('refresh_token' !== $grantType) {
            throw new RuntimeException('Invalid grant_type.');
        }

        $token = $request->get('refresh_token');
        if (!$token) {
            throw new RuntimeException('Missing refresh_token.');
        }

        $refreshToken = $this->findAndValidateRefreshToken($token);

        $clientId = $request->get('client_id');
        $clientSecret = $request->get('client_secret');

        if ($clientId && $clientSecret) {
            $server = $refreshToken->getServer();
            if ($server->getClientId()->toRfc4122() !== $clientId) {
                throw new RuntimeException('Invalid client.');
            }
            if (!$server->validateSecret($clientSecret)) {
                throw new RuntimeException('Invalid secret.');
            }
        }

        $response = $this->exchangeRefreshToken($refreshToken);

        return new JsonResponse($response);
    }
}
