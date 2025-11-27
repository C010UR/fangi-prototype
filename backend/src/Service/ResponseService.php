<?php

declare(strict_types=1);

namespace App\Service;

use Symfony\Component\ErrorHandler\Exception\FlattenException;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Serializer\Normalizer\AbstractObjectNormalizer;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

class ResponseService
{
    public const string KEY_ERROR = 'error';
    public const string KEY_ERROR_DESCRIPTION = 'error_description';
    public const string KEY_STATUS = 'status_code';
    public const string KEY_MESSAGE = 'message';

    public function __construct(
        private SerializerInterface $serializer,
        private TranslatorInterface $translator,
    ) {
    }

    private function serialize(mixed $data, bool $asData = false, array $context = []): string
    {
        if ($asData) {
            if (isset($context[AbstractObjectNormalizer::GROUPS])) {
                $context[AbstractObjectNormalizer::GROUPS] = array_merge($context[AbstractObjectNormalizer::GROUPS], ['long']);
            } else {
                $context[AbstractObjectNormalizer::GROUPS] = ['long'];
            }

            $context[AbstractObjectNormalizer::ENABLE_MAX_DEPTH] = false;
            $context[AbstractObjectNormalizer::MAX_DEPTH_HANDLER] = null;
            $context[AbstractObjectNormalizer::CIRCULAR_REFERENCE_LIMIT] = 9999;
            $context[AbstractObjectNormalizer::CIRCULAR_REFERENCE_HANDLER] = null;

            return $this->serializer->serialize($data, 'json', $context);
        } else {
            return $this->serializer->serialize($data, 'json');
        }
    }

    public function data(
        mixed $data,
        int $status = Response::HTTP_OK,
        array $headers = [],
        array $context = [],
    ): JsonResponse {
        return new JsonResponse(
            $this->serialize($data, true, $context),
            $status,
            $headers,
            true,
        );
    }

    public function simpleData(
        mixed $data,
        int $status = Response::HTTP_OK,
        array $headers = [],
    ): JsonResponse {
        return new JsonResponse(
            $this->serialize($data),
            $status,
            $headers,
            true,
        );
    }

    public static function messagePayload(string|array $message, int $status = Response::HTTP_OK): array
    {
        $messageKey = $status >= 400 ? static::KEY_ERROR_DESCRIPTION : static::KEY_MESSAGE;

        return [
            static::KEY_ERROR => $status >= 400,
            static::KEY_STATUS => $status,
            $messageKey => $message,
        ];
    }

    public function message(
        string $message,
        int $status = Response::HTTP_OK,
        array $headers = [],
        string $domain = 'messages',
        array $messageContext = [],
    ): JsonResponse {
        return new JsonResponse(
            $this->serialize(static::messagePayload(
                $this->translator->trans($message, $messageContext, domain: $domain),
                $status,
            )),
            $status,
            $headers,
            true,
        );
    }

    public static function debugPayload(
        string $message,
        int $status,
        FlattenException $error,
    ): array {
        return [
            static::KEY_ERROR => $status >= 400,
            static::KEY_STATUS => $status,
            static::KEY_ERROR_DESCRIPTION => $message,
            'file' => $error->getFile(),
            'line' => $error->getLine(),
            'trace' => $error->getTrace(),
        ];
    }

    public function debug(FlattenException $error, array $headers = [], string $domain = 'messages'): JsonResponse
    {
        $status = $error->getStatusCode();

        return new JsonResponse(
            $this->serialize(
                static::debugPayload(
                    $this->translator->trans($error->getMessage(), domain: $domain),
                    $status,
                    $error,
                ),
            ),
            $status,
            $headers,
            true,
        );
    }
}
