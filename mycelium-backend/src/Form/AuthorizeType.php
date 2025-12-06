<?php

declare(strict_types=1);

namespace App\Form;

use App\Entity\Server;
use App\OpenApi\Attribute as OAC;
use App\Util\Path;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CollectionType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Context\ExecutionContextInterface;

#[OAC\Schema('#/components/schemas/AuthorizeForm')]
class AuthorizeType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('server', EntityType::class, [
                'class' => Server::class,
                'invalid_message' => 'form.server.invalid',
                'constraints' => [
                    new Assert\NotBlank(message: 'form.server.empty'),
                ],
                'required' => true,
            ])
            ->add('files', CollectionType::class, [
                'entry_type' => TextType::class,
                'allow_add' => true,
                'allow_delete' => true,
                'entry_options' => [
                    'trim' => true,
                ],
                'invalid_message' => 'form.files.invalid',
                'constraints' => [
                    new Assert\All([
                        new Assert\NotBlank(message: 'form.files.empty'),
                        new Assert\Callback(callback: function ($value, ExecutionContextInterface $context) {
                            if (!Path::isValid($value)) {
                                $context->buildViolation('form.files.invalid_format')
                                    ->addViolation();
                            }
                        }),
                    ]),
                    new Assert\Unique(message: 'form.files.duplicate'),
                    new Assert\Count(min: 1, minMessage: 'form.files.at_least_one'),
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
