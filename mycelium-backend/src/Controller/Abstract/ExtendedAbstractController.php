<?php

declare(strict_types=1);

namespace App\Controller\Abstract;

use App\Entity\User;
use App\Service\FormResolver;
use App\Service\ResponseService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

abstract class ExtendedAbstractController extends AbstractController
{
    public static function getSubscribedServices(): array
    {
        return array_merge(parent::getSubscribedServices(), [
            'mycelium.response_service' => '?' . ResponseService::class,
            'mycelium.form_resolver' => '?' . FormResolver::class,
        ]);
    }

    protected function trans(string $message, array $parameters = [], string $domain = 'messages'): string
    {
        return $this->container->get('translator')->trans($message, $parameters, $domain);
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

    protected function submitForm(Request $request, string $formType, ?object $entity = null, array $formOptions = []): array|object
    {
        /** @var FormResolver $service */
        $service = $this->container->get('mycelium.form_resolver');

        return $service->resolve($request, $formType, $entity, $formOptions);
    }
}
