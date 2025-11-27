<?php

declare(strict_types=1);

namespace App\Controller;

use App\Controller\Abstract\ExtendedAbstractController;
use App\Form\PasswordResetRequestType;
use App\Form\PasswordResetType;
use App\OpenApi\Attribute as OAC;
use App\Repository\UserRepository;
use App\Security\PasswordReset\PasswordResetHandler;
use App\Util\StringHelper;
use DateTimeImmutable;
use OpenApi\Attributes as OA;
use Symfony\Component\DependencyInjection\Attribute\Target;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\RateLimiter\RateLimiterFactory;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/v1/password-reset', name: 'api_v1_auth_password_reset_')]
class PasswordResetController extends ExtendedAbstractController
{
    public function __construct(
        private PasswordResetHandler $passwordResetHandler,
        private UserRepository $userRepository,
    ) {
    }

    #[Route('', name: 'request', methods: ['POST'])]
    #[OA\Post(
        operationId: 'v1PasswordResetRequest',
        summary: 'Request Password Reset',
        tags: [
            'password-reset',
        ],
        requestBody: new OAC\JsonBody(
            description: 'Email of user that wants to reset password.',
            schema: new OAC\Model(PasswordResetRequestType::class),
        ),
        responses: [
            new OAC\SuccessResponse('Your password reset request was successful. Check your email to set a new password.'),
            new OAC\BadRequestResponse(),
            new OAC\TooManyRequestsResponse(),
            new OAC\InternalServerErrorResponse(),
        ],
        security: [],
    )]
    public function requestReset(
        Request $request,
        #[Target('costly_action.limiter')]
        RateLimiterFactory $rateLimiter,
    ): JsonResponse {
        $passwordResetRequest = $this->submitForm($request, PasswordResetRequestType::class);

        $limiter = $rateLimiter->create('mfa:' . StringHelper::key($passwordResetRequest['email']));
        $limit = $limiter->consume();
        $now = new DateTimeImmutable();

        if (false === $limit->isAccepted()) {
            return $this->jsonm(
                'security.password_reset.too_many_requests',
                ['%time%' => $limit->getRetryAfter()->diff($now)],
                status: Response::HTTP_TOO_MANY_REQUESTS,
            );
        }

        $user = $this->userRepository->findOneByEmail($passwordResetRequest['email']);

        if ($user) {
            $this->passwordResetHandler->preparePasswordReset($user);
        }

        return $this->jsonm('security.password_reset.request_success');
    }

    #[Route('/{token}', name: 'reset', methods: ['POST'])]
    #[OA\Post(
        operationId: 'v1PasswordReset',
        summary: 'Password Reset',
        tags: [
            'password-reset',
        ],
        parameters: [
            new OA\Parameter(
                name: 'token',
                description: 'Password reset token.',
                in: 'path',
                required: true,
                example: 'WS01mdh1w4Fmha7kHh5SW31rwLidkeweKx7qArRG',
                schema: new OA\Schema(
                    type: 'string',
                ),
            ),
        ],
        requestBody: new OAC\JsonBody(
            description: 'New password.',
            schema: new OAC\Model(PasswordResetType::class),
        ),
        responses: [
            new OAC\SuccessResponse('Your password reset Successfully. You can now log in using the new password.'),
            new OAC\BadRequestResponse('Password reset request is invalid. Please send a new request.'),
            new OAC\InternalServerErrorResponse(),
        ],
        security: [],
    )]
    public function reset(
        Request $request,
        string $token,
    ): JsonResponse {
        $passwordReset = $this->submitForm($request, PasswordResetType::class);

        $request = $this->passwordResetHandler->validateResetRequestAndFetchRequest($token);

        $this->passwordResetHandler->resetPassword($request, $passwordReset['password']);

        return $this->jsonm('security.password_reset.reset_success');
    }
}
