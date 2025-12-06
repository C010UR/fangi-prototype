<?php

declare(strict_types=1);

namespace App\Twig\Extension;

use App\Service\Translator;
use Symfony\Component\DependencyInjection\Attribute\AsTaggedItem;
use Twig\Extension\AbstractExtension;
use Twig\TwigFilter;

#[AsTaggedItem('twig.extension')]
class TranslatorExtension extends AbstractExtension
{
    public function __construct(
        private Translator $translator,
    ) {
    }

    public function getFilters()
    {
        return [
            new TwigFilter('trans_interval', $this->translator->transInterval(...)),
        ];
    }
}
