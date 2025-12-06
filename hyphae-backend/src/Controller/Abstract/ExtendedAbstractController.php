<?php

declare(strict_types=1);

namespace App\Controller\Abstract;

use App\Entity\User;
use App\Service\ResponseService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;

abstract class ExtendedAbstractController extends AbstractController
{
    public static function getSubscribedServices(): array
    {
        return array_merge(parent::getSubscribedServices(), [
            'mycelium.response_service' => '?' . ResponseService::class,
        ]);
    }

    protected function getUser(): User
    {
        return parent::getUser();
    }

    protected function jsons(
        mixed $data,
        int $status = 200,
        array $headers = [],
    ): JsonResponse {
        /** @var ResponseService $service */
        $service = $this->container->get('mycelium.response_service');

        return $service->simpleData($data, $status, $headers);
    }

    protected function jsonm(
        string $message,
        array $parameters = [],
        string $domain = 'messages',
        int $status = 200,
        array $headers = [],
    ): JsonResponse {
        /** @var ResponseService $service */
        $service = $this->container->get('mycelium.response_service');

        return $service->message($message, $status, $headers, $domain, $parameters);
    }

    protected function jsonl(
        mixed $data,
        int $status = 200,
        array $headers = [],
        array $context = [],
    ): JsonResponse {
        /** @var ResponseService $service */
        $service = $this->container->get('mycelium.response_service');

        return $service->data($data, $status, $headers, $context);
    }
}
