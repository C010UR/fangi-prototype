<?php

declare(strict_types=1);

namespace App\Serializer;

use App\Model\RelativeUrl;
use Symfony\Component\DependencyInjection\Attribute\AsTaggedItem;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;

#[AsTaggedItem('serializer.normalizer')]
class RelativeUrlNormalizer implements NormalizerInterface
{
    public function __construct()
    {
    }

    public function normalize(mixed $object, ?string $format = null, array $context = [])
    {
        return \sprintf('%s/%s', $_ENV['API_HOST'], ltrim(trim($object->url), '/'));
    }

    public function supportsNormalization(mixed $data, ?string $format = null)
    {
        return $data instanceof RelativeUrl;
    }

    public function getSupportedTypes($format): array
    {
        return [
            RelativeUrl::class => true,
        ];
    }
}
