<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\FileIndex;
use App\Entity\Session;
use App\Entity\User;
use App\Util\Path;
use Symfony\Bundle\SecurityBundle\Security;

class SecurityService
{
    public function __construct(
        private Security $security,
    ) {
    }

    public function getUser(): ?User
    {
        return $this->getSession()?->getUser();
    }

    public function getSession(): ?Session
    {
        return $this->security->getUser();
    }

    private function isReadPermission(?string $permission): bool
    {
        return null !== $permission && \in_array($permission, ['r', 'rw'], true);
    }

    private function isWritePermission(?string $permission): bool
    {
        return null !== $permission && \in_array($permission, ['rw'], true);
    }

    public function inUserReadScope(string $path, bool $isDirectory = false): bool
    {
        if (!Path::isValid($path)) {
            return false;
        }
        $scopes = $this->getSession()?->getScopes();
        if (empty($scopes)) {
            return false;
        }

        $normalizedInputPath = $isDirectory && !str_ends_with($path, '/') ? $path . '/' : $path;

        $scopeMap = [];
        foreach ($scopes as $scope) {
            $parts = explode(':', $scope, 2);
            if (2 !== \count($parts)) {
                continue;
            }
            $scopePath = $parts[0];
            if ('/' === $scopePath && $this->isReadPermission($parts[1])) {
                return true;
            }

            $scopeMap[$scopePath] = $parts[1];
        }

        if (isset($scopeMap[$normalizedInputPath]) && $this->isReadPermission($scopeMap[$normalizedInputPath])) {
            return true;
        }

        $pathParts = Path::toParts($path);
        foreach ($pathParts as $part) {
            if (isset($scopeMap[$part . '/']) && $this->isReadPermission($scopeMap[$part . '/'])) {
                return true;
            }
        }

        return false;
    }

    public function inUserWriteScope(string $path, bool $isDirectory = false): bool
    {
        if (!Path::isValid($path)) {
            return false;
        }
        $scopes = $this->getSession()?->getScopes();
        if (empty($scopes)) {
            return false;
        }

        $normalizedInputPath = $isDirectory && !str_ends_with($path, '/') ? $path . '/' : $path;

        foreach ($scopes as $scope) {
            $parts = explode(':', $scope, 2);
            if (2 !== \count($parts)) {
                continue;
            }
            $scopePath = $parts[0];
            $permission = $parts[1];

            if ('/' === $scopePath && $this->isWritePermission($permission)) {
                return true;
            }

            if ($scopePath === $normalizedInputPath && $this->isWritePermission($permission)) {
                return true;
            }

            if (Path::isDirectory($scopePath) && str_starts_with($normalizedInputPath, $scopePath) && $this->isWritePermission($permission)) {
                return true;
            }
        }

        return false;
    }

    /**
     * @param FileIndex[] $files
     *
     * @return FileIndex[]
     */
    public function filterReadFilesByUserScopes(string $path, array $files): ?array
    {
        if ($this->inUserReadScope($path, true)) {
            return $files;
        }

        $scopes = $this->getSession()?->getScopes() ?? [];
        $scopePaths = [];

        foreach ($scopes as $scope) {
            $parts = explode(':', $scope, 2);
            if (2 === \count($parts) && $this->isReadPermission($parts[1])) {
                $scopePaths[] = $parts[0];
            }
        }

        $filtered = [];

        foreach ($files as $file) {
            $filePath = $file->getPath();

            if (null === $filePath) {
                continue;
            }

            if ($this->inUserReadScope($filePath, $file->isDirectory())) {
                $filtered[] = $file;
                continue;
            }

            foreach ($scopePaths as $scopePath) {
                if (str_starts_with($scopePath, $filePath . '/')) {
                    $filtered[] = $file;
                    continue 2;
                }
            }
        }

        return empty($filtered) ? null : $filtered;
    }
}
