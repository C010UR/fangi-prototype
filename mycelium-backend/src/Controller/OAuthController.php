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

#[Route('', name: '')]
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
        tags: [
            'oauth',
        ],
        parameters: [
            new OA\Parameter(name: 'client_id', in: 'query', required: true, schema: new OA\Schema(type: 'string'), description: 'Client ID.'),
            new OA\Parameter(name: 'redirect_uri', in: 'query', required: true, schema: new OA\Schema(type: 'string'), description: 'Redirect URI.'),
            new OA\Parameter(name: 'state', in: 'query', schema: new OA\Schema(type: 'string'), description: 'State.'),
            new OA\Parameter(name: 'nonce', in: 'query', schema: new OA\Schema(type: 'string'), description: 'Nonce.'),
        ],
        requestBody: new OAC\JsonBody(
            description: 'Authorization Form',
            schema: new OAC\Model(AuthorizeType::class),
        ),
        responses: [
            new OA\Response(response: 302, description: 'Redirect to redirect_uri with code'),
            new OAC\UnauthorizedResponse(),
            new OAC\BadRequestResponse(),
            new OAC\InternalServerErrorResponse(),
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
        tags: [
            'oauth',
        ],
        requestBody: new OAC\JsonBody(
            description: 'Authorization Form',
            schema: new OAC\Model(AuthorizationCodeExchangeType::class),
        ),
        responses: [
            new OAC\JsonResponse(
                response: 200,
                description: 'Token Response',
                type: 'object',
                properties: [
                    new OA\Property(
                        property: 'token_type',
                        type: 'enum',
                        enum: ['Bearer'],
                        description: 'Token Type.',
                        example: 'Bearer',
                    ),
                    new OA\Property(
                        property: 'access_token',
                        type: 'string',
                        description: 'Access Token.',
                        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30',
                    ),
                    new OA\Property(
                        property: 'refresh_token',
                        type: 'string',
                        description: 'Refresh Token.',
                        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30',
                    ),
                    new OA\Property(
                        property: 'id_token',
                        type: 'string',
                        description: 'ID Token.',
                        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30',
                    ),
                ],
            ),
            new OAC\BadRequestResponse(),
            new OAC\InternalServerErrorResponse(),
        ],
        security: [],
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
        operationId: 'wellKnownJwks',
        summary: 'Well-known JWKS Endpoint',
        tags: [
            'well-known',
        ],
        responses: [
            new OAC\JsonResponse(
                response: 200,
                description: 'JWKS',
                type: 'object',
                properties: [
                    new OA\Property(property: 'keys', type: 'array', items: new OA\Items(type: 'object', properties: [
                        new OA\Property(
                            property: 'kty',
                            type: 'string',
                            description: 'Key Type.',
                            example: 'RSA',
                        ),
                        new OA\Property(
                            property: 'alg',
                            type: 'string',
                            description: 'Algorithm.',
                            example: 'RS256',
                        ),
                        new OA\Property(
                            property: 'use',
                            type: 'string',
                            description: 'Key Use.',
                            example: 'sig',
                        ),
                        new OA\Property(
                            property: 'kid',
                            type: 'string',
                            description: 'Key ID.',
                            example: 'e43fc84d9f48fca7',
                        ),
                        new OA\Property(
                            property: 'n',
                            type: 'string',
                            description: 'Modulus.',
                            example: 'fOajtMW20x6nghfKl2sTaD1CaK39WRlaPos3gcwFVHuEJPeYQ7Hz6knVb-1bbDITTbvk2hkU51ToX7iUCjcPaOyJNeRYc8LEMamSdN81oQXE9LVQ2QRGh99aiVkhPoxCkeTRwsQONk8-m2Y-xstewzG0uhKbnAEZpBqFyyuHXCU',
                        ),
                        new OA\Property(
                            property: 'e',
                            type: 'string',
                            description: 'Exponent.',
                            example: 'AQAB',
                        ),
                    ])),
                ],
            ),
            new OAC\InternalServerErrorResponse(),
        ],
        security: [],
    )]
    public function jwks(): JsonResponse
    {
        return $this->jsons($this->oauthServer->getJwks());
    }
}
