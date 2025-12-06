<?php

declare(strict_types=1);

namespace App\Form;

use App\OpenApi\Attribute as OAC;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\EmailType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints as Assert;

#[OAC\Schema('#/components/schemas/PasswordResetRequestForm')]
class PasswordResetRequestType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('email', EmailType::class, [
                'invalid_message' => 'form.email.invalid',
                'constraints' => [
                    new Assert\NotBlank(message: 'form.email.empty'),
                    new Assert\Email(message: 'form.email.invalid'),
                    new Assert\Length(max: 180, maxMessage: 'form.email.too_long'),
                ],
                'required' => true,
            ]);
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'extra_fields_message' => 'form.generic.extra_fields',
        ]);
    }
}
