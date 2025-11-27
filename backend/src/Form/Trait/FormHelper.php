<?php

declare(strict_types=1);

namespace App\Form\Trait;

use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\FormError;
use Symfony\Component\Form\FormEvent;
use Symfony\Component\Form\FormEvents;

trait FormHelper
{
    protected function addMinLengthValidation(FormBuilderInterface $builder)
    {
        $builder->addEventListener(FormEvents::POST_SUBMIT, function (FormEvent $event) {
            $form = $event->getForm();

            foreach ($form->all() as $child) {
                $minLength = $child->getConfig()->getOption('attr')['min-length'] ?? null;
                if (null !== $minLength && 0 === $child->getErrors()->count() && \count($child->getData()) < $minLength) {
                    $child->addError(new FormError(
                        'form.' . $child->getName() . '.too_short',
                        messageParameters: ['{{count}}' => $minLength],
                    ));
                }
            }
        });
    }
}
