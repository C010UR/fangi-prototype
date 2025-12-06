<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\Session;
use App\Entity\User;
use App\Repository\UserRepository;
use DateTimeImmutable;
use Doctrine\ORM\EntityManagerInterface;
use Firebase\JWT\JWK;
use Firebase\JWT\JWT;
use JsonException;
use SensitiveParameter;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Contracts\HttpClient\ResponseInterface;

class OAuthClient
{
    public function __construct(
        #[Autowire(param: 'hyphae.oauth.server')]
        private string $oauthServer,
        #[Autowire(param: 'hyphae.oauth.client_id')]
        private string $oauthClientId,
        #[Autowire(param: 'hyphae.oauth.client_secret')]
        private string $oauthClientSecret,
        #[Autowire(param: 'api_host')]
        private string $apiHost,
        private HttpClientInterface $client,
        private UserRepository $userRepository,
        private EntityManagerInterface $entityManager,
    ) {
    }

    private function getJWKS(): array
    {
        $response = $this->client->request(
            'GET',
            $this->oauthServer . '/.well-known/jwks.json',
            [
                'headers' => [
                    'Accept' => 'application/json',
                ],
            ],
        );

        if ($response->getStatusCode() >= 400) {
            throw new AuthenticationException('Failed to fetch JWKS');
        }

        try {
            $data = $response->toArray(false);
        } catch (JsonException $exception) {
            throw new AuthenticationException('Federated authenticated returned invalid json');
        }

        return $data;
    }

    private function processTokenResponse(ResponseInterface $response, #[SensitiveParameter] ?Session $session = null): Session
    {
        $jwks = $this->getJWKS();

        if ($response->getStatusCode() >= 400) {
            throw new AuthenticationException(\sprintf('Federated authenticator returned %s: %s', $response->getStatusCode(), $response->getContent(false)));
        }

        try {
            $data = $response->toArray(false);
        } catch (JsonException $exception) {
            throw new AuthenticationException('Federated authenticated returned invalid json');
        }

        $this->validateTokenData($data);

        $keys = JWK::parseKeySet($jwks);

        if (1 === \count($keys)) {
            $keys = current($keys);
        } else {
            throw new AuthenticationException('Federated authenticated returned invalid JWKS');
        }

        $accessToken = json_decode(json_encode(JWT::decode($data['access_token'], $keys)), true);
        $accessToken['raw'] = $data['access_token'];

        $refreshToken = json_decode(json_encode(JWT::decode($data['refresh_token'], $keys)), true);
        $refreshToken['raw'] = $data['refresh_token'];

        $idToken = json_decode(json_encode(JWT::decode($data['id_token'], $keys)), true);
        $idToken['raw'] = $data['id_token'];

        if (null === $session) {
            $user = $this->userRepository->findOneByEmail($idToken['email']);
            if (null === $user) {
                $user = new User();
            }
            $session = new Session();
            $session->setUser($user);
        } else {
            $user = $session->getUser();
        }

        $user
            ->setEmail($idToken['email'])
            ->setUsername($idToken['preferred_username'])
            ->setImageUrl($idToken['picture']);
        $this->entityManager->persist($user);

        $session
            ->setAccessToken($accessToken)
            ->setIdToken($idToken)
            ->setRefreshToken($refreshToken)
            ->setScopes($accessToken['scopes'])
            ->setExpiresAt(new DateTimeImmutable()->setTimestamp($accessToken['exp']));
        $this->entityManager->persist($session);
        $this->entityManager->flush();

        return $session;
    }

    public function authenticate(#[SensitiveParameter] string $code): Session
    {
        $response = $this->client->request('POST', $this->oauthServer . '/oauth/token', [
            'headers' => [
                'Accept' => 'application/json',
            ],
            'body' => [
                'client_id' => $this->oauthClientId,
                'client_secret' => $this->oauthClientSecret,
                'grant_type' => 'authorization_code',
                'code' => $code,
                'redirect_uri' => $this->apiHost,
            ],
        ]);

        return $this->processTokenResponse($response);
    }

    public function refreshSession(#[SensitiveParameter] Session $session): Session
    {
        $refreshTokenData = $session->getRefreshToken();

        if (empty($refreshTokenData['raw'])) {
            throw new AuthenticationException('No refresh token available');
        }

        $response = $this->client->request('POST', $this->oauthServer . '/oauth/token', [
            'headers' => [
                'Accept' => 'application/json',
            ],
            'body' => [
                'client_id' => $this->oauthClientId,
                'client_secret' => $this->oauthClientSecret,
                'grant_type' => 'refresh_token',
                'refresh_token' => $refreshTokenData['raw'],
            ],
        ]);

        return $this->processTokenResponse($response, $session);
    }

    private function validateTokenData(#[SensitiveParameter] array $data): void
    {
        if (empty($data['access_token'])) {
            throw new AuthenticationException('Access token is not valid');
        }

        if (empty($data['refresh_token'])) {
            throw new AuthenticationException('Refresh token is not valid');
        }

        if (empty($data['id_token'])) {
            throw new AuthenticationException('ID token is not valid');
        }
    }
}
