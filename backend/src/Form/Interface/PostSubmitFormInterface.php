<?php

declare(strict_types=1);

namespace App\Form\Interface;

use Symfony\Component\Form\FormInterface;

interface PostSubmitFormInterface
{
    public function postSubmit(FormInterface $form, object $entity, array $options): object;
}
