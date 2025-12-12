<?php

declare(strict_types=1);

namespace App\Controller;

use App\Controller\Abstract\ExtendedAbstractController;
use App\Entity\User;
use App\Form\RegistrationType;
use App\OpenApi\Attribute as OAC;
use App\Security\AccountRegistration\AccountRegistrationHandler;
use Doctrine\ORM\EntityManagerInterface;
use OpenApi\Attributes as OA;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/v1/register', name: 'api_v1_register_')]
final class RegistrationController extends ExtendedAbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private AccountRegistrationHandler $accountRegistrationHandler,
    ) {
    }

    #[Route('', name: 'register', methods: ['POST'])]
    #[OA\Post(
        operationId: 'v1Register',
        summary: 'Account Registration',
        tags: [
            'registration',
        ],
        requestBody: new OAC\FormDataBody(
            description: 'Account registration information.',
            schema: new OAC\Model(RegistrationType::class),
        ),
        responses: [
            new OAC\SuccessResponse('Account registered successfully. Please check your email for the activation link.'),
            new OAC\BadRequestResponse('Account registration request is invalid. Please send a new request.'),
            new OAC\InternalServerErrorResponse(),
        ],
        security: [],
    )]
    public function register(Request $request): JsonResponse
    {
        $user = new User();
        $this->submitForm($request, RegistrationType::class, $user);

        $this->entityManager->flush();

        $this->accountRegistrationHandler->prepareAccountRegistration($user);

        return $this->jsonm('security.account_registration.success');
    }

    #[Route('/{token}', name: 'reset', methods: ['POST'])]
    #[OA\Post(
        operationId: 'v1RegisterConfirm',
        summary: 'Account Registration Confirmation',
        tags: [
            'registration',
        ],
        parameters: [
            new OA\Parameter(
                name: 'token',
                description: 'Account registration token.',
                in: 'path',
                required: true,
                example: 'WS01mdh1w4Fmha7kHh5SW31rwLidkeweKx7qArRG',
                schema: new OA\Schema(
                    type: 'string',
                ),
            ),
        ],
        responses: [
            new OAC\SuccessResponse('Account registered successfully. You can now log in using your email and password.'),
            new OAC\BadRequestResponse('Account registration request is invalid. Please send a password reset request.'),
            new OAC\InternalServerErrorResponse(),
        ],
        security: [],
    )]
    public function reset(
        Request $request,
        string $token,
    ): JsonResponse {
        $request = $this->accountRegistrationHandler->validateResetRequestAndFetchRequest($token);

        $this->accountRegistrationHandler->registerUser($request);

        return $this->jsonm('security.account_registration.success_confirmation');
    }
}
