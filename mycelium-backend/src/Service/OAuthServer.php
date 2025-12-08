<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\AuthorizationCode;
use App\Entity\Module;
use App\Entity\RefreshToken;
use App\Entity\Server;
use App\Entity\User;
use App\Exception\OAuth\OAuthBadRequestException;
use App\Repository\AuthorizationCodeRepository;
use App\Repository\ModuleRepository;
use App\Repository\RefreshTokenRepository;
use App\Repository\ServerRepository;
use DateInterval;
use DateTimeImmutable;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\Uid\Uuid;
use Symfony\Contracts\Translation\TranslatorInterface;
use Throwable;

class OAuthServer
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private EncryptionService $encryptionService,
        private TranslatorInterface $translator,
        #[Autowire(param: 'mycelium.oauth_server.authorization_code_time')]
        private string $authorizationCodeTime,
        #[Autowire(param: 'mycelium.oauth_server.access_token_time')]
        private string $accessTokenTime,
        #[Autowire(param: 'mycelium.oauth_server.refresh_token_time')]
        private string $refreshTokenTime,
        #[Autowire(param: 'mycelium.oauth_server.id_token_time')]
        private string $idTokenTime,
        #[Autowire(param: 'mycelium.oauth_server.issuer')]
        private string $issuer,
        private ModuleRepository $moduleRepository,
        private ServerRepository $serverRepository,
        private AuthorizationCodeRepository $authorizationCodeRepository,
        private RefreshTokenRepository $refreshTokenRepository,
    ) {
    }

    private function validateRedirectUri(string $redirectUri, array $allowedHosts): void
    {
        if (!empty($allowedHosts) && !\in_array($redirectUri, $allowedHosts, true)) {
            throw new OAuthBadRequestException($this->translator->trans('oauth_server.invalid_redirect_uri'));
        }
    }

    public function findAndValidateModule(string $clientId, string $redirectUri): Module
    {
        try {
            $clientId = Uuid::fromRfc4122($clientId);
        } catch (Throwable $e) {
            throw new OAuthBadRequestException($this->translator->trans('oauth_server.module.invalid'));
        }

        $module = $this->moduleRepository->findOneByClientId($clientId);

        if (null === $module) {
            throw new OAuthBadRequestException($this->translator->trans('oauth_server.module.invalid'));
        }

        if (!$module->isActive()) {
            throw new OAuthBadRequestException($this->translator->trans('oauth_server.module.inactive', ['module' => $module->getName()]));
        }

        if ($module->isBanned()) {
            throw new OAuthBadRequestException($this->translator->trans('oauth_server.module.banned', ['module' => $module->getName()]));
        }

        $this->validateRedirectUri($redirectUri, $module->getUrls());

        return $module;
    }

    private function findAndValidateAuthorizationCode(string $token): ?AuthorizationCode
    {
        $authorizationCode = $this->authorizationCodeRepository->findOneByToken($this->encryptionService->hash($token));

        if (null === $authorizationCode) {
            throw new OAuthBadRequestException($this->translator->trans('oauth_server.authorization_code.invalid'));
        }

        if ($authorizationCode->getExpiresAt() < new DateTimeImmutable()) {
            throw new OAuthBadRequestException($this->translator->trans('oauth_server.authorization_code.expired'));
        }

        return $authorizationCode;
    }

    public function findAndValidateServer(string $clientId, string $secret, string $redirectUri): Server
    {

        try {
            $clientId = Uuid::fromRfc4122($clientId);
        } catch (Throwable $e) {
            throw new OAuthBadRequestException($this->translator->trans('oauth_server.server.invalid_client'));
        }

        $server = $this->serverRepository->findOneByClientId($clientId);

        if (null === $server) {
            throw new OAuthBadRequestException($this->translator->trans('oauth_server.server.invalid_client'));
        }

        if (!$server->isActive()) {
            throw new OAuthBadRequestException($this->translator->trans('oauth_server.server.inactive', ['server' => $server->getName()]));
        }

        if ($server->isBanned()) {
            throw new OAuthBadRequestException($this->translator->trans('oauth_server.server.banned', ['server' => $server->getName()]));
        }

        if (!$server->validateSecret($secret)) {
            throw new OAuthBadRequestException($this->translator->trans('oauth_server.server.invalid_secret'));
        }

        $this->validateRedirectUri($redirectUri, $server->getUrls());

        return $server;
    }

    public function validateAuthorizationCode(AuthorizationCode $authorizationCode, Server $server, string $redirectUri): void
    {
        if ($authorizationCode->getServer()->getId() !== $server->getId()) {
            throw new OAuthBadRequestException($this->translator->trans('oauth_server.server.invalid_client'));
        }

        $this->validateRedirectUri($redirectUri, [$authorizationCode->getRedirectUri()]);
    }

    private function findAndValidateRefreshToken(string $token): RefreshToken
    {
        $refreshToken = $this->refreshTokenRepository->findOneByToken($this->encryptionService->hash($token));

        if (null === $refreshToken) {
            throw new OAuthBadRequestException($this->translator->trans('oauth_server.refresh_token.invalid'));
        }

        if ($refreshToken->getExpiresAt() < new DateTimeImmutable()) {
            throw new OAuthBadRequestException($this->translator->trans('oauth_server.refresh_token.expired'));
        }

        return $refreshToken;
    }

    public function createAuthorizationCode(
        User $user,
        Server $server,
        array $scopes,
        ?string $state,
        ?string $nonce,
        DateTimeImmutable $now,
    ): string {
        $expiresAt = $now->add(new DateInterval($this->authorizationCodeTime));
        $token = $this->encryptionService->generateToken();

        $authorizationCode = new AuthorizationCode()
            ->setToken($this->encryptionService->hash($token))
            ->setUser($user)
            ->setServer($server)
            ->setScopes($scopes)
            ->setState($state)
            ->setNonce($nonce)
            ->setRedirectUri($server->getUrl())
            ->setExpiresAt($expiresAt);

        $this->entityManager->persist($authorizationCode);

        return $token;
    }

    public function consumeAuthorizationCode(AuthorizationCode $authorizationCode, DateTimeImmutable $now): array
    {
        $user = $authorizationCode->getUser();
        $scopes = $authorizationCode->getScopes();

        $this->entityManager->remove($authorizationCode);

        $plainAccessToken = $this->createAccessToken($user, $authorizationCode->getServer(), $scopes, $now);
        $plainRefreshToken = $this->createRefreshToken($user, $authorizationCode->getServer(), $scopes, $now);
        $plainIDToken = $this->createIDToken($user, $authorizationCode->getServer(), $authorizationCode->getNonce(), $now);

        return [
            'access_token' => $plainAccessToken,
            'refresh_token' => $plainRefreshToken,
            'id_token' => $plainIDToken,
            'token_type' => 'Bearer',
        ];
    }

    private function createAccessToken(User $user, Server $server, array $scopes, DateTimeImmutable $now): string
    {
        $accessTokenExpiresAt = $now->add(new DateInterval($this->accessTokenTime));
        $accessTokenPayload = [
            'sub' => (string)$user->getId(),
            'iss' => $this->issuer,
            'aud' => ($clientId = $server->getClientId()) ? [$clientId->toRfc4122()] : [],
            'iat' => $now->getTimestamp(),
            'exp' => $accessTokenExpiresAt->getTimestamp(),
            'scopes' => $scopes,
            'type' => 'access_token',
        ];

        return $this->encryptionService->encodeToken($accessTokenPayload);
    }

    private function createRefreshToken(User $user, Server $server, array $scopes, DateTimeImmutable $now): string
    {
        $refreshTokenExpiresAt = $now->add(new DateInterval($this->refreshTokenTime));
        $token = $this->encryptionService->generateToken();

        $refreshToken = new RefreshToken()
            ->setToken($this->encryptionService->hash($token))
            ->setUser($user)
            ->setServer($server)
            ->setScopes($scopes)
            ->setExpiresAt($refreshTokenExpiresAt);

        $this->entityManager->persist($refreshToken);

        return $token;
    }

    private function createIDToken(User $user, Server $server, ?string $nonce, DateTimeImmutable $now): string
    {
        $idTokenExpiresAt = $now->add(new DateInterval($this->idTokenTime));
        $idTokenPayload = [
            'sub' => $user->getId(),
            'iss' => $this->issuer,
            'aud' => $server->getClientId()?->toRfc4122(),
            'iat' => $now->getTimestamp(),
            'exp' => $idTokenExpiresAt->getTimestamp(),
            'email' => $user->getEmail(),
            'picture' => $user->getImageUrl(),
            'preferred_username' => $user->getUsername(),
            'nonce' => $nonce,
        ];
        if ($user->getImageUrl()) {
            $idTokenPayload['picture'] = $user->getImageUrl();
        }

        return $this->encryptionService->encodeToken($idTokenPayload);
    }

    public function consumeRefreshToken(RefreshToken $refreshToken, DateTimeImmutable $now): array
    {
        $user = $refreshToken->getUser();
        $server = $refreshToken->getServer();
        $scopes = $refreshToken->getScopes();

        $plainAccessToken = $this->createAccessToken($user, $server, $scopes, $now);
        $plainRefreshToken = $this->createRefreshToken($user, $server, $scopes, $now);
        $plainIDToken = $this->createIDToken($user, $server, null, $now);

        $this->entityManager->remove($refreshToken);

        return [
            'access_token' => $plainAccessToken,
            'refresh_token' => $plainRefreshToken,
            'id_token' => $plainIDToken,
            'token_type' => 'Bearer',
        ];
    }

    public function handleAuthCodeGenerationRequest(
        User $user,
        Server $server,
        string $redirectUri,
        array $scopes,
        ?string $state,
        ?string $nonce,
    ): string {
        $tokenString = $this->createAuthorizationCode(
            $user,
            $server,
            $scopes,
            $state,
            $nonce,
            new DateTimeImmutable(),
        );

        $queryParams = ['code' => $tokenString, 'server_uri' => $server->getUrl()];

        if (!empty($state)) {
            $queryParams['state'] = $state;
        }

        return $this->buildRedirectUrl($redirectUri, $queryParams);
    }

    private function buildRedirectUrl(string $uri, array $params): string
    {
        $parsedUrl = parse_url($uri);
        if (false === $parsedUrl) {
            throw new OAuthBadRequestException($this->translator->trans('oauth_server.invalid_redirect_uri'));
        }

        $currentParams = [];
        if (isset($parsedUrl['query'])) {
            parse_str($parsedUrl['query'], $currentParams);
        }

        $params = array_merge($currentParams, $params);
        $queryString = http_build_query($params);

        $scheme = isset($parsedUrl['scheme']) ? $parsedUrl['scheme'] . '://' : '';
        $host = $parsedUrl['host'] ?? '';
        $port = isset($parsedUrl['port']) ? ':' . $parsedUrl['port'] : '';
        $user = $parsedUrl['user'] ?? '';
        $pass = isset($parsedUrl['pass']) ? ':' . $parsedUrl['pass'] : '';
        $pass = ($user || $pass) ? "$pass@" : '';
        $path = $parsedUrl['path'] ?? '';
        $fragment = isset($parsedUrl['fragment']) ? '#' . $parsedUrl['fragment'] : '';

        return $scheme . $user . $pass . $host . $port . $path . '?' . $queryString . $fragment;
    }

    public function handleAuthCodeConsumptionRequest(
        string $code,
        string $redirectUri,
        string $clientId,
        string $clientSecret,
    ): array {
        $server = $this->findAndValidateServer($clientId, $clientSecret, $redirectUri);
        $authorizationCode = $this->findAndValidateAuthorizationCode($code);

        $this->validateAuthorizationCode($authorizationCode, $server, $redirectUri);

        $response = $this->consumeAuthorizationCode($authorizationCode, new DateTimeImmutable());

        return $response;
    }

    public function handleRefreshTokenConsumptionRequest(
        string $refreshToken,
        string $redirectUri,
        ?string $clientId,
        ?string $clientSecret,
    ): array {

        $refreshToken = $this->findAndValidateRefreshToken($refreshToken);
        $server = $this->findAndValidateServer($clientId, $clientSecret, $redirectUri);

        if (!$server->getSecret()) {
            throw new OAuthBadRequestException($this->translator->trans('oauth_server.server.invalid_client'));
        }

        if (!$clientId || !$clientSecret) {
            throw new OAuthBadRequestException($this->translator->trans('oauth_server.server.client_authentication_required'));
        }

        if ($server->getClientId()?->toRfc4122() !== $clientId) {
            throw new OAuthBadRequestException($this->translator->trans('oauth_server.server.invalid_client'));
        }

        if (!$server->validateSecret($clientSecret)) {
            throw new OAuthBadRequestException($this->translator->trans('oauth_server.server.invalid_client'));
        }

        $response = $this->consumeRefreshToken($refreshToken, new DateTimeImmutable());

        return $response;
    }
}
