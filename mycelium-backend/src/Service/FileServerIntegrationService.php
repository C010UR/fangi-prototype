<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\Server;
use App\Entity\User;
use App\Exception\OAuth\ServerUnavailableException;
use App\Repository\UserRepository;
use DateTimeImmutable;
use Doctrine\ORM\EntityManagerInterface;
use JsonException;
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
        private EncryptionService $encryptionService,
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
        $server->setAuthToken($this->encryptionService->encrypt($authToken));
    }

    private function getAuthToken(Server $server): ?string
    {
        if (null === $server->getAuthToken()) {
            return null;
        }

        return $this->encryptionService->decrypt($server->getAuthToken());
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

        $nonce = base64_encode(random_bytes(16));
        $authorizationCode = $this->oauthServer->createAuthorizationCode(
            $this->getServiceUser(),
            $server,
            ['/:rw'],
            '',
            $nonce,
            new DateTimeImmutable(),
        );

        $this->entityManager->flush();

        $response = $this->client->request(
            'POST',
            $server->getUrl() . '/api/v1/login?code=' . $authorizationCode . '&nonce=' . $nonce,
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
