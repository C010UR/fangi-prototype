<?php

declare(strict_types=1);

namespace App\Security;

use App\Entity\User;
use App\Security\Exception\UserBannedException;
use App\Security\Exception\UserDeactivatedException;
use App\Security\Exception\UserNotActivatedException;
use Symfony\Component\Security\Core\Role\RoleHierarchyInterface;
use Symfony\Component\Security\Core\User\UserCheckerInterface;
use Symfony\Component\Security\Core\User\UserInterface;

class UserChecker implements UserCheckerInterface
{
    public function __construct(public RoleHierarchyInterface $roleHierarchy)
    {
    }

    public function checkPreAuth(UserInterface $user): void
    {
        if (!$user instanceof User) {
            return;
        }

        if (!$user->isActive()) {
            throw new UserDeactivatedException();
        }

        if (!$user->isActivated()) {
            throw new UserNotActivatedException();
        }

        if ($user->isBanned()) {
            throw new UserBannedException();
        }
    }

    public function checkPostAuth(UserInterface $user): void
    {
        if (!$user instanceof User) {
            return;
        }
    }
}
