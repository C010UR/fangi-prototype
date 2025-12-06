<?php

declare(strict_types=1);

namespace App\Controller;

use App\Controller\Abstract\ExtendedAbstractController;
use App\OpenApi\Attribute as OAC;
use LogicException;
use OpenApi\Attributes as OA;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/v1', name: 'api_v1_auth_')]
final class AuthenticationController extends ExtendedAbstractController
{
    #[Route('/login', name: 'login', methods: ['POST'])]
    #[OA\Post(
        operationId: 'v1Login',
        summary: 'User Login',
        tags: [
            'auth',
        ],
        parameters: [
            new OA\Parameter(
                name: 'code',
                description: 'OAuth Authorization Code.',
                in: 'query',
                required: true,
                schema: new OA\Schema(
                    type: 'string',
                    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30',
                ),
            ),
        ],
        responses: [
            new OAC\JsonResponse(
                response: 200,
                description: 'Authentication successful.',
                type: 'object',
                properties: [
                    new OA\Property(
                        property: 'token',
                        type: 'string',
                        description: 'Authentication Token.',
                        example: '019af545-4bda-7285-928b-c9d4a5001f1b',
                    ),
                    new OA\Property(
                        property: 'user',
                        type: 'object',
                        properties: [
                            new OA\Property(
                                property: 'email',
                                type: 'string',
                                description: 'User email.',
                                example: 'admin@example.com',
                            ),
                            new OA\Property(
                                property: 'username',
                                type: 'string',
                                description: 'User username.',
                                example: 'admin',
                            ),
                        ],
                    ),
                    new OA\Property(
                        property: 'expires_at',
                        type: 'string',
                        description: 'Session expiration date.',
                        example: '2025-12-07T12:00:00Z',
                        format: 'date-time',
                    ),
                ],
            ),
            new OAC\BadRequestResponse(),
            new OAC\UnauthorizedResponse('Bad credentials.'),
            new OAC\InternalServerErrorResponse(),
        ],
        security: [],
    )]
    public function login(): JsonResponse
    {
        /*
         * @see App\Security\AuthenticationHandler
         */
        throw new LogicException('This method should be unreachable');
    }

    #[Route('/logout', name: 'logout', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    #[OA\Get(
        operationId: 'v1Logout',
        summary: 'User Logout',
        tags: [
            'auth',
        ],
        responses: [
            new OAC\SuccessResponse('Successfully logged out.'),
            new OAC\UnauthorizedResponse(),
            new OAC\InternalServerErrorResponse(),
        ],
    )]
    public function logout(): JsonResponse
    {
        /*
         * @see App\EventListener\LogoutListener
         */
        throw new LogicException('This method should be unreachable');
    }

    #[Route('/profile', name: 'profile', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    #[OA\Get(
        operationId: 'v1Profile',
        summary: 'User Profile',
        tags: [
            'auth',
        ],
        responses: [
            new OAC\JsonResponse(
                response: 200,
                description: 'Successfully retrieved profile.',
                schema: '#/components/schemas/User',
            ),
            new OAC\UnauthorizedResponse(),
            new OAC\InternalServerErrorResponse(),
        ],
    )]
    public function profile(): JsonResponse
    {
        return $this->jsonl($this->getUser());
    }
}
