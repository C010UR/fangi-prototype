<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\Server;
use App\Entity\User;
use App\Exception\OAuth\ServerUnavailableException;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use JsonException;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Contracts\HttpClient\ResponseInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

class FileServerIntegrationService
{
    public const string SERVICE_USER_EMAIL = 'system';

    public function __construct(
        private EntityManagerInterface $entityManager,
        private UserRepository $userRepository,
        private OAuthServer $oauthServer,
        private HttpClientInterface $client,
        private TranslatorInterface $translator,
        #[Autowire(param: 'kernel.secret')]
        private string $appSecret,
    ) {
    }

    public function getServiceUser(): User
    {
        $user = $this->userRepository->findOneBy(['email' => static::SERVICE_USER_EMAIL]);

        if (!$user) {
            $user = new User();
            $user->setEmail(static::SERVICE_USER_EMAIL);
            $user->setUsername(static::SERVICE_USER_EMAIL);
            $user->setPassword('');
            $this->entityManager->persist($user);
            $this->entityManager->flush();
        }

        return $user;
    }

    private function setAuthToken(Server $server, string $authToken): void
    {
        $iv = substr($this->appSecret, 0, 16);
        $encryptedAuthToken = openssl_encrypt(
            $authToken,
            'aes-256-cbc',
            $this->appSecret,
            \OPENSSL_RAW_DATA,
            $iv,
        );
        $server->setAuthToken(base64_encode($encryptedAuthToken));
    }

    private function getAuthToken(Server $server): ?string
    {
        if (null === $server->getAuthToken()) {
            return null;
        }

        $encryptedAuthToken = base64_decode($server->getAuthToken(), true);
        $iv = substr($this->appSecret, 0, 16);
        $authToken = openssl_decrypt(
            $encryptedAuthToken,
            'aes-256-cbc',
            $this->appSecret,
            \OPENSSL_RAW_DATA,
            $iv,
        );

        return $authToken;
    }

    private function readDataFromResponse(ResponseInterface $response): array
    {
        try {
            return $response->toArray(false);
        } catch (JsonException $exception) {
            throw new ServerUnavailableException($this->translator->trans('server.not_working'));
        }
    }

    private function isAuthenticatedOnServer(Server $server): bool
    {
        if (null === $server->getAuthToken()) {
            return false;
        }

        $response = $this->client->request(
            'GET',
            $server->getUrl() . '/api/v1/profile',
            [
                'auth_bearer' => $this->getAuthToken($server),
                'headers' => [
                    'Accept' => 'application/json',
                ],
            ],
        );

        if (401 === $response->getStatusCode()) {
            return false;
        }

        if (200 !== $response->getStatusCode()) {
            $data = $this->readDataFromResponse($response);

            throw new ServerUnavailableException($this->translator->trans('server.unavailable', ['status' => $response->getStatusCode(), 'message' => $data['error_description'] ?? 'No message']));
        }

        $data = $this->readDataFromResponse($response);

        if (self::SERVICE_USER_EMAIL !== $data['email'] || true !== $data['is_system']) {
            throw new ServerUnavailableException($this->translator->trans('server.not_working'));
        }

        return true;
    }

    private function authenticateOnServer(Server $server): void
    {
        if ($this->isAuthenticatedOnServer($server)) {
            return;
        }

        $authorizationCode = $this->oauthServer->createAuthorizationCode(
            $this->getServiceUser(),
            $server,
            ['/:rw'],
            '',
            '',
        );

        $this->entityManager->flush();

        $response = $this->client->request(
            'POST',
            $server->getUrl() . '/api/v1/login?code=' . $authorizationCode,
            [
                'headers' => [
                    'Accept' => 'application/json',
                ],
            ],
        );

        if (200 !== $response->getStatusCode()) {
            $data = $this->readDataFromResponse($response);

            throw new ServerUnavailableException($this->translator->trans('server.unavailable', ['status' => $response->getStatusCode(), 'message' => $data['error_description'] ?? 'No message']));
        }

        $data = $this->readDataFromResponse($response);

        if (null === $data['token']) {
            throw new ServerUnavailableException($this->translator->trans('server.not_working'));
        }

        $this->setAuthToken($server, $data['token']);
        $this->entityManager->flush();
    }

    public function listFiles(Server $server, string $path = ''): array
    {
        $this->authenticateOnServer($server);

        $response = $this->client->request(
            'GET',
            $server->getUrl() . '/api/v1/ls' . $path,
            [
                'auth_bearer' => $this->getAuthToken($server),
                'headers' => [
                    'Accept' => 'application/json',
                ],
            ],
        );

        if (200 !== $response->getStatusCode()) {
            $data = $this->readDataFromResponse($response);

            throw new ServerUnavailableException($this->translator->trans('server.unavailable', ['status' => $response->getStatusCode(), 'message' => $data['error_description'] ?? 'No message']));
        }

        $data = $this->readDataFromResponse($response);

        return $data;
    }
}
