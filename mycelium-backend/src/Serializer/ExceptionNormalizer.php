<?php

declare(strict_types=1);

namespace App\Serializer;

use App\Service\ResponseService;
use App\Util\Environment;
use Symfony\Component\DependencyInjection\Attribute\AsTaggedItem;
use Symfony\Component\ErrorHandler\Exception\FlattenException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;
use Symfony\Contracts\Translation\TranslatorInterface;

// #[AsTaggedItem('serializer.normalizer')]
class ExceptionNormalizer implements NormalizerInterface
{
    public function __construct(private TranslatorInterface $translator)
    {
    }

    public function normalize(mixed $object, ?string $format = null, array $context = [])
    {
        /** @var FlattenException|HttpException $object */
        $domain = 'messages';
        $message = $object->getMessage();
        $parameters = [];

        if ($object->getStatusCode() >= 500) {
            if (Environment::isDev()) {
                return ResponseService::debugPayload(
                    $this->translator->trans($message, $parameters, $domain),
                    $object->getStatusCode(),
                    $object,
                );
            } else {
                return ResponseService::messagePayload(
                    $this->translator->trans('Internal Server Error.', $parameters, $domain),
                    $object->getStatusCode(),
                );
            }
        } else {
            return ResponseService::messagePayload(
                $this->translator->trans($message, $parameters, $domain),
                $object->getStatusCode(),
            );
        }
    }

    public function supportsNormalization(mixed $data, ?string $format = null)
    {
        return $data instanceof FlattenException || $data instanceof HttpException;
    }

    public function getSupportedTypes($format): array
    {
        return [
            FlattenException::class => true,
            HttpException::class => true,
        ];
    }
}
