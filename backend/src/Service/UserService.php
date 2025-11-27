<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\Security\Core\Role\RoleHierarchyInterface;

class UserService
{
    private array $roleHierarchy;

    public function __construct(
        #[Autowire(service: 'service_container')]
        ContainerInterface $container,
        private RoleHierarchyInterface $roleHierarchyDecider,
        private EntityManagerInterface $entityManager,
        private Security $security,
    ) {
        $this->roleHierarchy = $container->getParameter('security.role_hierarchy.roles');
    }

    public function getUser(): ?User
    {
        return  $this->security->getUser();
    }

    /**
     * TODO: use Security to check roles after Symfony 7.3.
     *
     * @see https://symfony.com/blog/new-in-symfony-7-3-arbitrary-user-permission-checks
     */
    private function hasRoles(User $user, array $roles): bool
    {
        $userRoles = $this->roleHierarchyDecider->getReachableRoleNames($user->getRoles());

        return !empty(array_intersect($roles, $userRoles));
    }

    public function activate(User $user): User
    {
        $user->setIsActive(true);

        $this->entityManager->persist($user);

        return $user;
    }

    public function deactivate(User $user): User
    {
        $user->setIsActive(false);

        if ($this->security->getUser()->getUserIdentifier() === $user->getUserIdentifier()) {
            $this->security->logout(false);
        }

        $this->entityManager->persist($user);

        return $user;
    }

    /**
     * DO NOT USE IN ANYTHING RELATED TO BUSINESS LOGIC, ONLY FOR API DOCUMENTATION.
     */
    public function getParentRoles(array $roles): array
    {
        $allRoles = $roles;
        $queue = $roles;
        $processed = [];

        while (!empty($queue)) {
            $currentRole = array_shift($queue);

            if (\array_key_exists($currentRole, $processed)) {
                continue;
            }

            $processed[$currentRole] = $currentRole;

            foreach ($this->roleHierarchy as $parentRole => $children) {
                if (\in_array($currentRole, $children, true)) {
                    $allRoles[$parentRole] = $parentRole;

                    if (!\array_key_exists($parentRole, $processed)) {
                        $queue[] = $parentRole;
                    }
                }
            }
        }

        return $allRoles;
    }
}
