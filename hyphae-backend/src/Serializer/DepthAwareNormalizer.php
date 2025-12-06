<?php

declare(strict_types=1);

namespace App\Serializer;

use App\Serializer\Interface\DepthAwareNormalizableInterface;
use ArrayObject;
use Symfony\Component\DependencyInjection\Attribute\AsTaggedItem;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\Serializer\Normalizer\AbstractNormalizer;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;

#[AsTaggedItem('serializer.normalizer', -999)]
class DepthAwareNormalizer implements NormalizerInterface
{
    public const int NORMALIZATION_DEPTH = 1;
    private const string DEPTH_KEY = 'current_normalization_depth';

    public const string CONTEXT_NORMALIZATION_DEPTH = 'normalization_depth';
    public const string CONTEXT_EXTENDED_DEPTH = 'extended_depth';

    public const string GROUP_SHORT = 'short';
    public const string GROUP_LONG = 'long';

    public function __construct(
        #[Autowire(service: 'serializer.normalizer.object')]
        private NormalizerInterface $normalizer,
    ) {
    }

    public function normalize(mixed $object, ?string $format = null, array $context = []): array|string|int|float|bool|ArrayObject|null
    {
        $normalizationDepth = $context[static::NORMALIZATION_DEPTH] ?? static::NORMALIZATION_DEPTH;
        $currentDepth = ($context[static::DEPTH_KEY] ?? 0) + 1;

        $context[AbstractNormalizer::GROUPS] ??= [];

        if (isset($context[static::CONTEXT_EXTENDED_DEPTH]) && true === $context[static::CONTEXT_EXTENDED_DEPTH]) {
            unset($context[static::CONTEXT_EXTENDED_DEPTH]);
            --$currentDepth;
        }

        $context[static::DEPTH_KEY] = $currentDepth;

        if (
            $currentDepth > $normalizationDepth
            && \in_array(static::GROUP_LONG, $context[AbstractNormalizer::GROUPS], true)
        ) {
            $context[AbstractNormalizer::GROUPS] = array_merge(
                array_diff($context[AbstractNormalizer::GROUPS], [static::GROUP_LONG]),
                [static::GROUP_SHORT],
            );
        }

        return $this->normalizer->normalize($object, $format, $context);
    }

    public function supportsNormalization(mixed $data, ?string $format = null)
    {
        return $data instanceof DepthAwareNormalizableInterface;
    }

    public function getSupportedTypes($format): array
    {
        return [
            DepthAwareNormalizableInterface::class => true,
        ];
    }
}
