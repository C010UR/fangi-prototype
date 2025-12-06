<?php

declare(strict_types=1);

namespace App\DataFixtures;

use App\DataFixtures\Consts\FixtureConsts;
use App\DataFixtures\Consts\FixtureReferenceConsts;
use App\Entity\MfaMethod;
use App\Entity\User;
use App\Enum\MfaType;
use App\Enum\UserRole;
use DateTimeImmutable;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class UserFixtures extends AbstractFixture
{
    public function __construct(
        private readonly UserPasswordHasherInterface $passwordHasher,
    ) {
        parent::__construct();
    }

    public function load(ObjectManager $manager): void
    {
        $admin = $this->createUser(
            $manager,
            email: FixtureConsts::ADMIN_USER_EMAIL,
            roles: [UserRole::ADMIN],
            createdBy: null,
            reference: FixtureReferenceConsts::USER_ADMIN,
        );

        $this->createUser(
            $manager,
            email: FixtureConsts::USER_EMAIL,
            roles: [UserRole::USER],
            createdBy: $admin,
            reference: FixtureReferenceConsts::USER_USER,
        );

        $manager->flush();
    }

    private function createUser(
        ObjectManager $manager,
        string $email,
        array $roles,
        ?User $createdBy = null,
        ?string $reference = null,
    ): User {
        $lastLoginAt = $this->faker->numberBetween(1, 10);

        $user = new User()
            ->setEmail($email)
            ->setUsername($this->faker->userName())
            ->setRoles($roles)
            ->setIsActive(true)
            ->setIsActivated(true)
            ->setLastLoginAt(new DateTimeImmutable(\sprintf('-%d day', $lastLoginAt)));

        if (null !== $createdBy) {
            $user->setCreatedBy($user);
        }

        $hashedPassword = $this->passwordHasher->hashPassword($user, FixtureConsts::USER_PASSWORD);
        $user->setPassword($hashedPassword);

        $mfaMethod = new MfaMethod();
        $mfaMethod
            ->setMethod(MfaType::Email->value)
            ->setRecipient($user->getEmail());

        $manager->persist($mfaMethod);

        $user
            ->addMfaMethod($mfaMethod);

        $manager->persist($user);

        if (null !== $reference) {
            $this->addReference($reference, $user);
        }

        return $user;
    }
}
