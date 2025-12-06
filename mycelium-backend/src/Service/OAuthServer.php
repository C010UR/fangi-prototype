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
use App\Exception\OAuth\OAuthBadRequestException;
use App\Repository\AccessTokenRepository;
use App\Repository\AuthorizationCodeRepository;
use App\Repository\IDTokenRepository;
use App\Repository\ModuleRepository;
use App\Repository\RefreshTokenRepository;
use App\Repository\ServerRepository;
use DateTimeImmutable;
use Doctrine\ORM\EntityManagerInterface;
use Firebase\JWT\JWT;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\Uid\Uuid;
use Throwable;

class OAuthServer
{
    public const string ISSUER = 'mycelium';

    private string $jwtPrivateKeyContents;
    private string $jwtPublicKeyContents;

    public function __construct(
        private EntityManagerInterface $entityManager,
        #[Autowire(param: 'mycelium.oauth.jwt_private_key')]
        private string $jwtPrivateKey,
        #[Autowire(param: 'mycelium.oauth.jwt_public_key')]
        private string $jwtPublicKey,
        #[Autowire(param: 'mycelium.oauth.jwt_algorithm')]
        private string $jwtAlgorithm,
        #[Autowire(param: 'mycelium.oauth.authorization_code_ttl')]
        private int $authorizationCodeTtl,
        #[Autowire(param: 'mycelium.oauth.access_token_ttl')]
        private int $accessTokenTtl,
        #[Autowire(param: 'mycelium.oauth.refresh_token_ttl')]
        private int $refreshTokenTtl,
        #[Autowire(param: 'mycelium.oauth.id_token_ttl')]
        private int $idTokenTtl,
        private ModuleRepository $moduleRepository,
        private ServerRepository $serverRepository,
        private AuthorizationCodeRepository $authorizationCodeRepository,
        private RefreshTokenRepository $refreshTokenRepository,
        private IDTokenRepository $idTokenRepository,
        private AccessTokenRepository $accessTokenRepository,
    ) {
        $this->jwtPrivateKeyContents = file_get_contents($this->jwtPrivateKey);
        $this->jwtPublicKeyContents = file_get_contents($this->jwtPublicKey);
    }

    private function hashToken(string $token): string
    {
        return hash('sha256', $token);
    }

    public function findAndValidateModule(string $clientId, string $redirectUri): Module
    {
        try {
            $clientId = Uuid::fromRfc4122($clientId);
        } catch (Throwable $e) {
            throw new OAuthBadRequestException('Invalid client.');
        }

        $module = $this->moduleRepository->findOneByClientId($clientId);

        if (null === $module) {
            throw new OAuthBadRequestException('Invalid client.');
        }

        if ($module->getUrls() && !\in_array($redirectUri, $module->getUrls(), true)) {
            throw new OAuthBadRequestException('Invalid redirect URI.');
        }

        return $module;
    }

    private function findAndValidateAuthorizationCode(string $token): ?AuthorizationCode
    {
        $authorizationCode = $this->authorizationCodeRepository->findOneByToken($this->hashToken($token));

        if (null === $authorizationCode) {
            throw new OAuthBadRequestException('Invalid authorization code.');
        }

        if ($authorizationCode->getExpiresAt() < new DateTimeImmutable()) {
            throw new OAuthBadRequestException('Authorization code expired.');
        }

        return $authorizationCode;
    }

    public function findAndValidateServer(string $clientId, string $secret, string $redirectUri): Server
    {

        try {
            $clientId = Uuid::fromRfc4122($clientId);
        } catch (Throwable $e) {
            throw new OAuthBadRequestException('Invalid client.');
        }

        $server = $this->serverRepository->findOneByClientId($clientId);

        if (null === $server) {
            throw new OAuthBadRequestException('Invalid client.');
        }

        if (!$server->validateSecret($secret)) {
            throw new OAuthBadRequestException('Invalid secret.');
        }

        if ($server->getUrls() && !\in_array($redirectUri, $server->getUrls(), true)) {
            throw new OAuthBadRequestException('Invalid redirect URI.');
        }

        return $server;
    }

    public function validateAuthorizationCode(AuthorizationCode $authorizationCode, Server $server, string $redirectUri): void
    {
        if ($authorizationCode->getServer()->getId() !== $server->getId()) {
            throw new OAuthBadRequestException('Invalid client.');
        }

        if ($authorizationCode->getRedirectUri() !== $redirectUri) {
            throw new OAuthBadRequestException('Invalid redirect URI.');
        }
    }

    private function findAndValidateRefreshToken(string $token): RefreshToken
    {
        $refreshToken = $this->refreshTokenRepository->findOneByToken($this->hashToken($token));

        if (null === $refreshToken) {
            throw new OAuthBadRequestException('Invalid refresh token.');
        }

        if ($refreshToken->getExpiresAt() < new DateTimeImmutable()) {
            throw new OAuthBadRequestException('Refresh token expired.');
        }

        return $refreshToken;
    }

    public function createAuthorizationCode(
        User $user,
        Server $server,
        array $scopes = [],
        string $state = '',
        string $nonce = '',
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

        $token = JWT::encode($payload, $this->jwtPrivateKeyContents, $this->jwtAlgorithm);

        $authorizationCode = new AuthorizationCode()
            ->setToken($this->hashToken($token))
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

    public function exchangeAuthorizationCode(AuthorizationCode $authorizationCode): array
    {
        $user = $authorizationCode->getUser();
        $scopes = $authorizationCode->getScopes();
        $now = new DateTimeImmutable();

        [$accessTokenEntity, $plainAccessToken] = $this->createAccessToken($user, $authorizationCode->getServer(), $scopes, $now);
        [$refreshTokenEntity, $plainRefreshToken] = $this->createRefreshToken($user, $authorizationCode->getServer(), $scopes, $now);
        [$idTokenEntity, $plainIDToken] = $this->createIDToken($user, $authorizationCode->getServer(), $authorizationCode->getNonce(), $now);

        $this->entityManager->remove($authorizationCode);

        return [
            'access_token' => $plainAccessToken,
            'refresh_token' => $plainRefreshToken,
            'id_token' => $plainIDToken,
            'token_type' => 'Bearer',
        ];
    }

    /**
     * @return array{0: AccessToken, 1: string}
     */
    private function createAccessToken(User $user, Server $server, array $scopes, DateTimeImmutable $now): array
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
        $accessTokenString = JWT::encode($accessTokenPayload, $this->jwtPrivateKeyContents, $this->jwtAlgorithm);

        $accessToken = new AccessToken()
            ->setToken($this->hashToken($accessTokenString))
            ->setUser($user)
            ->setServer($server)
            ->setScopes($scopes)
            ->setTokenType('Bearer')
            ->setAudience($clientId ? [$clientId->toRfc4122()] : [])
            ->setExpiresAt($accessTokenExpiresAt);

        $this->entityManager->persist($accessToken);

        return [$accessToken, $accessTokenString];
    }

    /**
     * @return array{0: RefreshToken, 1: string}
     */
    private function createRefreshToken(User $user, Server $server, array $scopes, DateTimeImmutable $now): array
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
        $refreshTokenString = JWT::encode($refreshTokenPayload, $this->jwtPrivateKeyContents, $this->jwtAlgorithm);

        $refreshToken = new RefreshToken()
            ->setToken($this->hashToken($refreshTokenString))
            ->setUser($user)
            ->setServer($server)
            ->setScopes($scopes)
            ->setExpiresAt($refreshTokenExpiresAt);

        $this->entityManager->persist($refreshToken);

        return [$refreshToken, $refreshTokenString];
    }

    /**
     * @return array{0: IDToken, 1: string}
     */
    private function createIDToken(User $user, Server $server, ?string $nonce, DateTimeImmutable $now): array
    {
        $idTokenExpiresAt = $now->modify('+' . $this->idTokenTtl . ' seconds');
        $idTokenPayload = [
            'sub' => $user->getId(),
            'iss' => self::ISSUER,
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

        $idTokenString = JWT::encode($idTokenPayload, $this->jwtPrivateKeyContents, $this->jwtAlgorithm);

        $idToken = new IDToken()
            ->setToken($this->hashToken($idTokenString))
            ->setUser($user)
            ->setServer($server)
            ->setExpiresAt($idTokenExpiresAt);

        $this->entityManager->persist($idToken);

        return [$idToken, $idTokenString];
    }

    public function exchangeRefreshToken(RefreshToken $refreshToken): array
    {
        $user = $refreshToken->getUser();
        $server = $refreshToken->getServer();
        $scopes = $refreshToken->getScopes();
        $now = new DateTimeImmutable();

        [$accessTokenEntity, $plainAccessToken] = $this->createAccessToken($user, $server, $scopes, $now);
        [$newRefreshTokenEntity, $plainRefreshToken] = $this->createRefreshToken($user, $server, $scopes, $now);
        [$idTokenEntity, $plainIDToken] = $this->createIDToken($user, $server, null, $now);

        $this->entityManager->remove($refreshToken);

        return [
            'access_token' => $plainAccessToken,
            'refresh_token' => $plainRefreshToken,
            'id_token' => $plainIDToken,
            'token_type' => 'Bearer',
            'expires_in' => $this->accessTokenTtl,
        ];
    }

    public function handleAuthCodeConsumptionRequest(array $data): array
    {
        $grantType = $data['grant_type'];
        if ('authorization_code' !== $grantType) {
            throw new OAuthBadRequestException('Invalid grant_type.');
        }

        $code = $data['code'];
        $redirectUri = $data['redirect_uri'];
        $clientId = $data['client_id'];
        $clientSecret = $data['client_secret'];

        $server = $this->findAndValidateServer($clientId, $clientSecret, $redirectUri);
        $authorizationCode = $this->findAndValidateAuthorizationCode($code);

        $this->validateAuthorizationCode($authorizationCode, $server, $redirectUri);

        $response = $this->exchangeAuthorizationCode($authorizationCode);

        return $response;
    }

    public function handleRefreshTokenConsumptionRequest(array $data): array
    {
        $grantType = $data['grant_type'];
        if ('refresh_token' !== $grantType) {
            throw new OAuthBadRequestException('Invalid grant_type.');
        }

        $token = $data['refresh_token'];

        $refreshToken = $this->findAndValidateRefreshToken($token);

        $clientId = $data['client_id'];
        $clientSecret = $data['client_secret'];

        if ($clientId && $clientSecret) {
            $server = $refreshToken->getServer();
            if ($server->getClientId()->toRfc4122() !== $clientId) {
                throw new OAuthBadRequestException('Invalid client.');
            }
            if (!$server->validateSecret($clientSecret)) {
                throw new OAuthBadRequestException('Invalid secret.');
            }
        }

        $response = $this->exchangeRefreshToken($refreshToken);

        return $response;
    }

    public function getJwks(): array
    {
        $key = openssl_pkey_get_public($this->jwtPublicKeyContents);
        $details = openssl_pkey_get_details($key);

        if (!isset($details['rsa'])) {
            throw new OAuthBadRequestException('Only RSA keys are supported for now.');
        }

        return [
            'keys' => [
                [
                    'kty' => 'RSA',
                    'alg' => 'RS256',
                    'use' => 'sig',
                    'kid' => $this->generateKid($this->jwtPublicKeyContents),
                    'n'   => $this->base64UrlEncode($details['rsa']['n']),
                    'e'   => $this->base64UrlEncode($details['rsa']['e']),
                ],
            ],
        ];
    }

    private function generateKid(string $key): string
    {
        return substr(hash('sha256', $key), 0, 16);
    }

    private function base64UrlEncode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    public function getJwtPublicKey(): string
    {
        return $this->jwtPublicKeyContents;
    }
}
