<?php

declare(strict_types=1);

namespace App\Service;

use DateInterval;
use Symfony\Component\DependencyInjection\Attribute\AsDecorator;
use Symfony\Contracts\Translation\TranslatorInterface;

#[AsDecorator(TranslatorInterface::class)]
class Translator implements TranslatorInterface
{
    public function __construct(
        private TranslatorInterface $translator,
    ) {
    }

    public function getLocale(): string
    {
        return $this->translator->getLocale();
    }

    public function trans(string $id, array $parameters = [], ?string $domain = null, ?string $locale = null): string
    {
        foreach ($parameters as $key => $parameter) {
            if ($parameter instanceof DateInterval) {
                $parameters[$key] = $this->transInterval($parameter, $locale);
            }
        }


        return $this->translator->trans($id, $parameters, $domain, $locale);
    }

    public function transInterval(DateInterval $interval, ?string $locale = null): string
    {
        switch ($interval) {
            case $interval->y > 0:
                $count = $interval->y;
                $message = '{count} year';
                break;
            case $interval->m > 0:
                $count = $interval->m;
                $message = '{count} month';
                break;
            case $interval->d > 0:
                $count = $interval->d;
                $message = '{count} day';
                break;
            case $interval->h > 0:
                $count = $interval->h;
                $message = '{count} hour';
                break;
            case $interval->i > 0:
                $count = $interval->i;
                $message = '{count} minute';
                break;
            default:
                $count = $interval->s;
                $message = '{count} second';
        }

        return $this->translator->trans($message, ['count' => $count], 'messages', $locale);
    }
}
