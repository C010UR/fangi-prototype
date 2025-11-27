<?php

declare(strict_types=1);

namespace App\OpenApi\Processor;

use App\Enum\UserRole;
use App\OpenApi\Attribute as OAC;
use App\Service\UserService;
use OpenApi\Analysis;
use OpenApi\Annotations as OAA;
use OpenApi\Generator;
use Symfony\Component\DependencyInjection\Attribute\AsTaggedItem;

#[AsTaggedItem('nelmio_api_doc.swagger.processor')]
class RoleOpenApiProcessor
{
    public function __construct(
        private UserService $userService,
    ) {
    }

    public function __invoke(Analysis $analysis)
    {
        foreach ($analysis->getAnnotationsOfType(OAA\Operation::class) ?? [] as $annotation) {
            $this->processOperations($annotation);
        }
    }

    private function processOperations(OAA\Operation $operation): void
    {
        foreach ($operation->responses as $response) {
            if (!($response instanceof OAC\AccessDeniedResponse)) {
                continue;
            }

            $text = \sprintf(
                'Required roles: [__%s__]',
                implode('__; __', $this->userService->getParentRoles($response->roles)),
            );


            if (!\in_array(UserRole::PUBLIC, $response->roles, true)) {
                $operation->description = (Generator::UNDEFINED === $operation->description ? '' : $operation->description . "\n\n") . $text;
            }

            break;
        }
    }
}
