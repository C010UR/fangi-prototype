<?php

declare(strict_types=1);

namespace App\Form;

use App\OpenApi\Attribute as OAC;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints\Callback;
use Symfony\Component\Validator\Constraints\NotBlank;
use Symfony\Component\Validator\Context\ExecutionContextInterface;

#[OAC\Schema('#/components/schemas/AuthorizationCodeExchangeForm')]
class AuthorizationCodeExchangeType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('grant_type', ChoiceType::class, [
                'choices' => [
                    'authorization_code' => 'authorization_code',
                    'refresh_token' => 'refresh_token',
                ],
                'constraints' => [
                    new NotBlank(),
                ],
            ])
            ->add('redirect_uri', TextType::class, [
                'required' => true,
                'invalid_message' => 'form.redirect_uri.invalid',
            ])
            ->add('client_id', TextType::class, [
                'required' => true,
                'invalid_message' => 'form.client_id.invalid',
            ])
            ->add('client_secret', TextType::class, [
                'required' => true,
                'invalid_message' => 'form.client_secret.invalid',
            ])
            ->add('code', TextType::class, [
                'required' => false,
                'invalid_message' => 'form.code.invalid',
            ])
            ->add('refresh_token', TextType::class, [
                'required' => false,
                'invalid_message' => 'form.refresh_token.invalid',
            ]);
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'extra_fields_message' => 'form.generic.extra_fields',
            'constraints' => [
                new Callback([$this, 'validate']),
            ],
        ]);
    }

    public function validate(array $data, ExecutionContextInterface $context): void
    {
        if (!isset($data['grant_type'])) {
            return;
        }

        if ('authorization_code' === $data['grant_type']) {
            if (empty($data['code'])) {
                $context->buildViolation('form.code.required')
                    ->atPath('[code]')
                    ->addViolation();
            }
            if (!empty($data['refresh_token'])) {
                $context->buildViolation('form.refresh_token.should_not_be_present')
                    ->atPath('[refresh_token]')
                    ->addViolation();
            }
        } elseif ('refresh_token' === $data['grant_type']) {
            if (empty($data['refresh_token'])) {
                $context->buildViolation('form.refresh_token.required')
                    ->atPath('[refresh_token]')
                    ->addViolation();
            }
            if (!empty($data['code'])) {
                $context->buildViolation('form.code.should_not_be_present')
                    ->atPath('[code]')
                    ->addViolation();
            }
        }
    }
}
