<?php

declare(strict_types=1);

namespace App\Form;

use App\OpenApi\Attribute as OAC;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\PasswordType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints as Assert;

#[OAC\Schema('#/components/schemas/PasswordResetForm')]
class PasswordResetType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('password', PasswordType::class, [
                'constraints' => [
                    new Assert\NotBlank(message: 'form.password.empty'),
                    new Assert\PasswordStrength(minScore: Assert\PasswordStrength::STRENGTH_MEDIUM, message: 'form.password.too_weak'),
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
