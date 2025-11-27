<?php

declare(strict_types=1);

namespace App\Form;

use App\Entity\Server;
use App\OpenApi\Attribute as OAC;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CollectionType;
use Symfony\Component\Form\Extension\Core\Type\FileType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\Extension\Core\Type\UrlType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints as Assert;

#[OAC\Schema('#/components/schemas/ServerForm')]
class ServerType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('name', TextType::class, [
                'invalid_message' => 'form.name.invalid',
                'constraints' => [
                    new Assert\NotBlank(message: 'form.name.empty'),
                    new Assert\Length(min: 3, max: 255, minMessage: 'form.name.too_short', maxMessage: 'form.name.too_long'),
                ],
                'required' => true,
            ])
            ->add('image', FileType::class, [
                'invalid_message' => 'form.image.invalid',
                'constraints' => [
                    new Assert\File(mimeTypes: ['image/jpeg', 'image/png', 'image/gif'], mimeTypesMessage: 'form.image.invalid_mime_type'),
                    new Assert\Image(maxSize: '8192k', maxSizeMessage: 'form.image.too_large'),
                ],
                'required' => false,
                'mapped' => false,
            ])
            ->add('allowed_urls', CollectionType::class, [
                'entry_type' => UrlType::class,
                'invalid_message' => 'form.allowed_urls.invalid',
                'constraints' => [
                    new Assert\All([
                        new Assert\Url(message: 'form.allowed_urls.invalid_url'),
                    ]),
                ],
                'allow_add' => true,
                'allow_delete' => true,
                'by_reference' => false,
                'required' => false,
            ]);
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => Server::class,
            'extra_fields_message' => 'form.generic.extra_fields',
        ]);
    }
}
