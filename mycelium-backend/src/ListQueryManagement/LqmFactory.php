<?php

declare(strict_types=1);

namespace App\ListQueryManagement;

use App\Entity\User;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Security\Core\Role\RoleHierarchyInterface;

class LqmFactory
{
    public function __construct(
        private Security $security,
        private RoleHierarchyInterface $roleHierarchy,
    ) {
    }

    public function create(Request $request, string $entity, ?User $user = null): LqmProcessor
    {
        $user ??= $this->security->getUser();

        $roles = $this->roleHierarchy->getReachableRoleNames($user->getRoles());

        return new LqmProcessor($request, $entity, $roles);
    }
}
