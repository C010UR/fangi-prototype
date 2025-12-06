<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\FileIndex;
use App\Entity\Session;
use App\Entity\User;
use App\Util\Path;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\RequestStack;

class SecurityService
{
    public function __construct(
        private RequestStack $request,
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

    private function getPathPermission(string $path): ?string
    {
        if (!Path::isValid($path)) {
            return null;
        }

        $scopes = $this->getSession()?->getScopes();

        if (empty($scopes)) {
            return null;
        }

        $scopeMap = [];
        foreach ($scopes as $scope) {
            $parts = explode(':', $scope, 2);
            if (2 === \count($parts)) {
                $scopeMap[$parts[0]] = $parts[1];
            }
        }

        $pathParts = Path::toParts($path);

        $mode = null;

        foreach ($pathParts as $part) {
            if (isset($scopeMap[$part])) {
                $mode = $scopeMap[$part];
            }
        }

        return $mode;
    }

    private function isReadPermission(?string $permission): bool
    {
        return null !== $permission && \in_array($permission, ['r', 'rw'], true);
    }

    private function isWritePermission(?string $permission): bool
    {
        return null !== $permission && \in_array($permission, ['rw'], true);
    }

    public function canRead(string $path): bool
    {
        return $this->isReadPermission($this->getPathPermission($path));
    }

    public function canWrite(string $path): bool
    {
        return $this->isWritePermission($this->getPathPermission($path));
    }

    /**
     * @param FileIndex[] $files
     *
     * @return FileIndex[]
     */
    public function filterFilesByPermissions(string $path, array $files): ?array
    {
        if ($this->canRead($path)) {
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

            if ($this->canRead($filePath)) {
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
