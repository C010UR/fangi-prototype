<?php

declare(strict_types=1);

namespace App\Controller;

use App\Controller\Abstract\ExtendedAbstractController;
use App\OpenApi\Attribute as OAC;
use App\Security\MFA\MFAHandler;
use App\Util\StringHelper;
use DateTimeImmutable;
use LogicException;
use OpenApi\Attributes as OA;
use Symfony\Component\DependencyInjection\Attribute\Target;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\RateLimiter\RateLimiterFactory;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Core\Authentication\Token\Storage\TokenStorageInterface;
use UnexpectedValueException;

#[Route('/api/v1/mfa', name: 'api_v1_auth_mfa_')]
final class MFAController extends ExtendedAbstractController
{
    #[Route('/verify', name: 'verify', methods: ['POST'])]
    #[OA\Post(
        operationId: 'v1MfaVerify',
        summary: 'MFA Verify Code',
        tags: [
            'mfa',
        ],
        requestBody: new OAC\JsonBody(
            description: 'Authentication token with MFA information.',
            properties: [
                new OA\Property(
                    property: 'code',
                    type: 'string',
                    description: 'Authentication Code.',
                    example: '123789',
                ),
            ],
        ),
        responses: [
            new OAC\JsonResponse(
                response: 200,
                description: 'Authentication token with MFA information.',
                type: 'object',
                properties: [
                    new OA\Property(
                        property: 'token',
                        type: 'string',
                        description: 'Authentication Token.',
                        example: 'e93a49a530be76f1afbe54605a771d462d407f3911ded5ed3a0968431bf43117',
                    ),
                    new OA\Property(
                        property: 'mfa_required',
                        type: 'boolean',
                        description: 'Whether MFA Authentication is required.',
                        example: false,
                    ),
                    new OA\Property(
                        property: 'priority_mfa_method',
                        type: 'object',
                        nullable: true,
                        ref: '#/components/schemas/MFAMethod',
                        description: 'Priority MFA method information.',
                    ),
                    new OA\Property(
                        property: 'available_mfa_methods',
                        type: 'array',
                        nullable: true,
                        description: 'Available MFA method information.',
                        items: new OA\Items(
                            ref: '#/components/schemas/MFAMethod',
                        ),
                    ),
                ],
            ),
            new OAC\UnauthorizedResponse('Invalid Multi-factor Authentication code.'),
            new OAC\AccessDeniedResponse(description: 'User is not in a Multi-factor authentication process.'),
            new OAC\InternalServerErrorResponse(),
        ],
    )]
    public function verify(): JsonResponse
    {
        throw new LogicException('This method should be unreachable');
    }

    #[Route('/available', name: 'get', methods: ['GET'])]
    #[OA\Get(
        operationId: 'v1MfaAvailable',
        summary: 'MFA Available methods',
        tags: [
            'mfa',
        ],
        responses: [
            new OAC\JsonResponse(
                response: 200,
                description: 'MFA information.',
                type: 'object',
                properties: [
                    new OA\Property(
                        property: 'priority_mfa_method',
                        type: 'object',
                        ref: '#/components/schemas/MFAMethod',
                        description: 'Priority MFA method information.',
                    ),
                    new OA\Property(
                        property: 'available_mfa_methods',
                        type: 'array',
                        description: 'Available MFA method information.',
                        items: new OA\Items(
                            ref: '#/components/schemas/MFAMethod',
                        ),
                    ),
                ],
            ),
            new OAC\UnauthorizedResponse(),
            new OAC\InternalServerErrorResponse(),
        ],
    )]
    public function getMfa(): JsonResponse
    {
        $user = $this->getUser();

        return $this->jsons([
            'priority_mfa_method' => $user->getPriorityMfaMethod(),
            'available_mfa_methods' => $user->getMfaMethods(),
        ]);
    }

    #[Route('/send-request/{method}', name: 'send_request', methods: ['POST'])]
    #[OA\Post(
        operationId: 'v1MfaSendRequest',
        summary: 'MFA Send Request',
        tags: [
            'mfa',
        ],
        parameters: [
            new OA\Parameter(
                name: 'method',
                description: 'MFA Method',
                in: 'path',
                required: true,
                example: 'email',
                schema: new OA\Schema(ref: '#/components/schemas/MFAType'),
            ),
        ],
        responses: [
            new OAC\JsonResponse(
                response: 200,
                description: 'When the request was sent and when use can make the next request.',
                type: 'object',
                properties: [
                    new OA\Property(
                        property: 'sent_at',
                        type: 'string',
                        format: 'date-time',
                        description: 'When the request was sent.',
                        example: '2025-10-31T12:00:00+00:00',
                    ),
                    new OA\Property(
                        property: 'next_request_available_in',
                        type: 'integer',
                        format: 'int32',
                        minimum: 0,
                        description: 'Time until next request can be made in seconds.',
                    ),
                ],
            ),
            new OAC\UnauthorizedResponse('Request Multi-factor Authentication method is not supported by the user.'),
            new OAC\AccessDeniedResponse(),
            new OAC\TooManyRequestsResponse(),
            new OAC\InternalServerErrorResponse(),
        ],
    )]
    public function sendMfaRequest(
        string $method,
        MFAHandler $mfaHandler,
        TokenStorageInterface $tokenStorage,
        #[Target('costly_action.limiter')]
        RateLimiterFactory $rateLimiter,
    ): JsonResponse {
        $token = $tokenStorage->getToken();

        if (!$token || !$token->getUser()) {
            throw new UnexpectedValueException('MFA Request sent by unauthenticated user.');
        }

        $limiter = $rateLimiter->create('mfa:' . StringHelper::key($token->getUser()->getUserIdentifier()));
        $limit = $limiter->consume();
        $now = new DateTimeImmutable();

        if (false === $limit->isAccepted()) {
            return $this->jsonm(
                'security.mfa.too_many_requests',
                ['%time%' => $limit->getRetryAfter()->diff($now)],
                status: Response::HTTP_TOO_MANY_REQUESTS,
            );
        }

        $result = $mfaHandler->sendCode($tokenStorage->getToken(), $method);

        if (null === $result) {
            return $this->jsonm(
                'security.mfa.unsupported',
                status: Response::HTTP_UNAUTHORIZED,
            );
        }

        $limit = $limiter->consume();
        $result['next_request_available_in'] = $limit->getRetryAfter()
            ? max(0, $limit->getRetryAfter()->getTimestamp() - time())
            : 0;

        return $this->jsons($result);
    }
}
