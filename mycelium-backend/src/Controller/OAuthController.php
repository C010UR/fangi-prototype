<?php

declare(strict_types=1);

namespace App\Controller;

use App\Controller\Abstract\ExtendedAbstractController;
use App\Entity\Server;
use App\Exception\OAuth\OAuthBadRequestException;
use App\Form\AuthorizationCodeExchangeType;
use App\Form\AuthorizeType;
use App\OpenApi\Attribute as OAC;
use App\Repository\ModuleRepository;
use App\Service\OAuthServer;
use Doctrine\ORM\EntityManagerInterface;
use OpenApi\Attributes as OA;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

class OAuthController extends ExtendedAbstractController
{
    public function __construct(
        private OAuthServer $oauthServer,
        private ModuleRepository $moduleRepository,
        private EntityManagerInterface $entityManager,
    ) {
    }

    #[Route('/oauth/authorize', name: 'oauth_authorize', methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    #[OA\Post(
        operationId: 'oauthAuthorize',
        summary: 'OAuth 2.0 Authorization',
        tags: ['oauth'],
        parameters: [
            new OA\Parameter(name: 'client_id', in: 'query', required: true, schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'redirect_uri', in: 'query', required: true, schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'state', in: 'query', schema: new OA\Schema(type: 'string')),
            new OA\Parameter(name: 'nonce', in: 'query', schema: new OA\Schema(type: 'string')),
        ],
        requestBody: new OAC\JsonBody(
            description: 'Authorization Form',
            schema: new OAC\Model(AuthorizeType::class),
        ),
        responses: [
            new OA\Response(response: 302, description: 'Redirect to redirect_uri with code'),
            new OAC\BadRequestResponse(),
        ],
    )]
    public function submit(Request $request): Response
    {
        $clientId = $request->query->get('client_id');
        $redirectUri = $request->query->get('redirect_uri');

        if (!$clientId || !$redirectUri) {
            throw new OAuthBadRequestException('Missing parameter: client_id or redirect_uri');
        }

        $module = $this->oauthServer->findAndValidateModule($clientId, $redirectUri);

        $data = $this->submitForm($request, AuthorizeType::class);

        /** @var Server $authorizedServer */
        $authorizedServer = $data['server'];
        /** @var array $files */
        $files = array_map(fn(string $file) => $file . ':rw', $data['files']);

        $tokenString = $this->oauthServer->createAuthorizationCode(
            $this->getUser(),
            $authorizedServer,
            $files,
            $request->query->get('state', ''),
            $request->query->get('nonce', ''),
            $redirectUri,
        );

        $queryParams = ['code' => $tokenString, 'server_url' => $authorizedServer->getUrl()];

        if ($state = $request->query->get('state')) {
            $queryParams['state'] = $state;
        }

        $url = \sprintf(
            '%s%s%s',
            $redirectUri,
            null === parse_url($redirectUri, \PHP_URL_QUERY) ? '?' : '&',
            http_build_query($queryParams),
        );

        $this->entityManager->flush();

        return new RedirectResponse($url);
    }

    #[Route('/oauth/token', name: 'oauth_token', methods: ['POST'])]
    #[OA\Post(
        operationId: 'oauthToken',
        summary: 'OAuth 2.0 Token Endpoint',
        tags: ['oauth'],
        requestBody: new OA\RequestBody(
            content: new OA\MediaType(
                mediaType: 'application/x-www-form-urlencoded',
                schema: new OA\Schema(
                    properties: [
                        new OA\Property(property: 'grant_type', type: 'string', enum: ['authorization_code', 'refresh_token']),
                        new OA\Property(property: 'code', type: 'string'),
                        new OA\Property(property: 'redirect_uri', type: 'string'),
                        new OA\Property(property: 'client_id', type: 'string'),
                        new OA\Property(property: 'client_secret', type: 'string'),
                        new OA\Property(property: 'refresh_token', type: 'string'),
                    ],
                    required: ['grant_type'],
                ),
            ),
        ),
        responses: [
            new OAC\JsonResponse(200, 'Token Response', schema: new OA\Schema(properties: [
                new OA\Property(property: 'access_token', type: 'string'),
                new OA\Property(property: 'token_type', type: 'string'),
                new OA\Property(property: 'expires_in', type: 'integer'),
                new OA\Property(property: 'refresh_token', type: 'string'),
                new OA\Property(property: 'id_token', type: 'string'),
            ])),
            new OAC\BadRequestResponse(),
        ],
    )]
    public function token(Request $request): JsonResponse
    {
        $data = $this->submitForm($request, AuthorizationCodeExchangeType::class);
        $grantType = $data['grant_type'];

        if ('authorization_code' === $grantType) {
            $response = $this->oauthServer->handleAuthCodeConsumptionRequest($data);
        } elseif ('refresh_token' === $grantType) {
            $response = $this->oauthServer->handleRefreshTokenConsumptionRequest($data);
        } else {
            throw new OAuthBadRequestException('Invalid grant_type');
        }

        $this->entityManager->flush();

        return $this->jsons($response);
    }

    #[Route('/.well-known/jwks.json', name: 'well_known_jwks', methods: ['GET'])]
    #[OA\Get(
        operationId: 'oauthJwks',
        summary: 'OAuth 2.0 JWKS Endpoint',
        tags: ['oauth'],
        responses: [
            new OAC\JsonResponse(200, 'JWKS', schema: new OA\Schema(properties: [
                new OA\Property(property: 'keys', type: 'array', items: new OA\Items(type: 'object')),
            ])),
        ],
    )]
    public function jwks(): JsonResponse
    {
        return $this->jsons($this->oauthServer->getJwks());
    }
}
