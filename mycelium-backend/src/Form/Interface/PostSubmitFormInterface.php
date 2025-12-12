<?php

declare(strict_types=1);

namespace App\Form\Interface;

use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Form\FormInterface;

interface PostSubmitFormInterface
{
    public function postSubmit(
        FormInterface $form,
        EntityManagerInterface $entityManager,
        object|array $entity,
        array $options,
    ): object;
}
