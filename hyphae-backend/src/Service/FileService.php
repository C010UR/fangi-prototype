<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\FileIndex;
use App\Exception\FileException;
use App\Exception\FileForbiddenException;
use App\Repository\FileIndexRepository;
use App\Util\Path;
use DateTimeImmutable;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpFoundation\File\UploadedFile;

class FileService
{
    private string $projectDir;
    private string $uploadsDir;

    public function __construct(
        #[Autowire(param: 'kernel.project_dir')]
        string $projectDir,
        private FileIndexRepository $fileIndexRepository,
        private EntityManagerInterface $entityManager,
        private SecurityService $securityService,
    ) {
        $this->projectDir = \sprintf('%s/var/hyphae', $projectDir);
        $this->uploadsDir = \sprintf('%s/data', $this->projectDir);
    }

    public function initializeFolder(): void
    {
        if (!file_exists($this->projectDir)) {
            mkdir($this->projectDir, 0o777, true);
        }

        if (!file_exists($this->uploadsDir)) {
            mkdir($this->uploadsDir, 0o777, true);
        }
    }

    public function getUploadsDir(): string
    {
        return $this->uploadsDir;
    }

    private function toFullPath(string $path): string
    {
        if (!Path::isValid($path)) {
            throw new FileException('file.invalid_path');
        }

        return \sprintf('%s%s', $this->uploadsDir, $path);
    }

    private function createDirectoryFileIndex(string $path): FileIndex
    {
        return new FileIndex()
            ->setPath($path)
            ->setParent(\dirname($path))
            ->setName(basename($path))
            ->setContentType('directory')
            ->setIsDirectory(true)
            ->setPermissions(0o777)
            ->setCreatedBy($this->securityService->getUser())
            ->setUpdatedBy($this->securityService->getUser());
    }

    private function createFileFileIndex(string $path, UploadedFile $file): FileIndex
    {
        return new FileIndex()
            ->setPath($path)
            ->setParent(\dirname($path))
            ->setName(basename($path))
            ->setContentType($file->getMimeType())
            ->setIsDirectory(false)
            ->setPermissions(0o777)
            ->setCreatedBy($this->securityService->getUser())
            ->setUpdatedBy($this->securityService->getUser());
    }

    private function copyFileIndex(FileIndex $fileIndex, string $newPath): FileIndex
    {
        return new FileIndex()
            ->setPath($newPath)
            ->setParent(\dirname($newPath))
            ->setName(basename($newPath))
            ->setContentType($fileIndex->getContentType())
            ->setIsDirectory($fileIndex->isDirectory())
            ->setPermissions($fileIndex->getPermissions())
            ->setCreatedBy($this->securityService->getUser())
            ->setUpdatedBy($this->securityService->getUser());
    }

    private function ensureParentExists(string $path): void
    {
        $parentPath = \dirname($path);

        if ('/' === $parentPath) {
            return;
        }

        $parent = $this->fileIndexRepository->findByPath($parentPath);

        if (!$parent) {
            throw new FileException('file.parent_not_found');
        }

        if (!$parent->isDirectory()) {
            throw new FileException('file.parent_not_directory');
        }
    }

    public function createDirectory(string $path): FileIndex
    {
        if (!$this->securityService->canWrite($path)) {
            throw new FileForbiddenException('file.path_not_found');
        }

        $this->ensureParentExists($path);

        $fullPath = $this->toFullPath($path);

        if (file_exists($fullPath) && is_file($fullPath)) {
            $fileIndex = $this->fileIndexRepository->findByPath($path);

            if (!$fileIndex || $fileIndex->isDirectory()) {
                throw new FileException('file.inconsistent_index');
            } else {
                throw new FileException('file.path_is_file');
            }
        } elseif (file_exists($fullPath) && is_dir($fullPath)) {
            $fileIndex = $this->fileIndexRepository->findByPath($path);

            if (!$fileIndex || !$fileIndex->isDirectory()) {
                throw new FileException('file.inconsistent_index');
            } else {
                $fileIndex->setUpdatedAt(new DateTimeImmutable());
                $fileIndex->setUpdatedBy($this->securityService->getUser());
                $this->entityManager->persist($fileIndex);
            }

            return $fileIndex;
        } else {
            $fileIndex = $this->createDirectoryFileIndex($path);
            $this->entityManager->persist($fileIndex);

            mkdir($fullPath, 0o755, true);

            return $fileIndex;
        }
    }

    public function createFile(string $path, UploadedFile $file): FileIndex
    {
        if (!$this->securityService->canWrite($path)) {
            throw new FileForbiddenException('file.path_not_found');
        }

        $this->ensureParentExists($path);

        $fullPath = $this->toFullPath($path);

        if (file_exists($fullPath) && is_dir($fullPath)) {
            $fileIndex = $this->fileIndexRepository->findByPath($path);

            if (!$fileIndex || !$fileIndex->isDirectory()) {
                throw new FileException('file.inconsistent_index');
            } else {
                throw new FileException('file.path_is_dir');
            }
        } elseif (file_exists($fullPath) && is_file($fullPath)) {
            $fileIndex = $this->fileIndexRepository->findByPath($path);

            if (!$fileIndex || $fileIndex->isDirectory()) {
                throw new FileException('file.path_is_dir');
            } else {
                $fileIndex->setContentType($file->getMimeType());
                $fileIndex->setUpdatedAt(new DateTimeImmutable());
                $fileIndex->setUpdatedBy($this->securityService->getUser());
                $this->entityManager->persist($fileIndex);

                unlink($fullPath);
                $file->move(\dirname($fullPath), basename($fullPath));

                return $fileIndex;
            }
        } else {
            $fileIndex = $this->createFileFileIndex($path, $file);
            $this->entityManager->persist($fileIndex);

            $file->move(\dirname($fullPath), basename($fullPath));

            return $fileIndex;
        }
    }

    public function list(string $path): array
    {
        if (!Path::isValid($path)) {
            throw new FileException('file.invalid_path');
        }

        $result = $this->securityService->filterFilesByPermissions(
            $path,
            $this->fileIndexRepository->findDirectChildrenByParent($path),
        );

        if (null === $result) {
            throw new FileForbiddenException('file.path_not_found');
        }

        return $result;
    }

    public function head(string $path): FileIndex
    {
        if (!$this->securityService->canRead($path)) {
            throw new FileForbiddenException('file.path_not_found');
        }

        $fileIndex = $this->fileIndexRepository->findByPath($path);

        if (!$fileIndex) {
            throw new FileForbiddenException('file.path_not_found');
        }

        return $fileIndex;
    }

    public function read(string $path): string
    {
        $this->head($path);

        $path = $this->toFullPath($path);

        if (!file_exists($path)) {
            throw new FileForbiddenException('file.path_not_found');
        }

        return $path;
    }

    public function delete(string $path): void
    {
        $fileIndex = $this->head($path);

        if (!$this->securityService->canWrite($path)) {
            throw new FileForbiddenException('file.access_denied');
        }

        $fullPath = $this->toFullPath($path);

        if ($fileIndex->isDirectory()) {
            $descendants = $this->fileIndexRepository->findAllByParent($path);
            foreach ($descendants as $descendant) {
                if ($descendant->getParent() === $path || str_starts_with($descendant->getParent(), $path . '/')) {
                    $this->entityManager->remove($descendant);
                }
            }

            if (file_exists($fullPath)) {
                $this->deleteDirectory($fullPath);
            }
        } else {
            if (file_exists($fullPath)) {
                unlink($fullPath);
            }
        }

        $this->entityManager->remove($fileIndex);
    }

    public function move(string $path, string $newPath): FileIndex
    {
        $fileIndex = $this->head($path);

        if (!$this->securityService->canWrite($path)) {
            throw new FileForbiddenException('file.access_denied');
        }

        if (!$this->securityService->canWrite($newPath)) {
            throw new FileForbiddenException('file.access_denied');
        }

        $this->ensureParentExists($newPath);

        $fullPath = $this->toFullPath($path);
        $newFullPath = $this->toFullPath($newPath);

        if (!file_exists($fullPath)) {
            throw new FileException('file.source_not_found');
        }

        $newFileIndex = $this->fileIndexRepository->findByPath($newPath);

        if (file_exists($newFullPath)) {
            if (is_dir($newFullPath)) {
                throw new FileException('file.target_is_directory');
            }
            unlink($newFullPath);
        }

        if ($newFileIndex) {
            $this->entityManager->remove($newFileIndex);
        }

        rename($fullPath, $newFullPath);

        if ($fileIndex->isDirectory()) {
            $descendants = $this->fileIndexRepository->findAllByParent($path);
            foreach ($descendants as $descendant) {
                if ($descendant->getParent() === $path || str_starts_with($descendant->getParent(), $path . '/')) {
                    $relative = substr($descendant->getPath(), \strlen($path));
                    $descendant->setPath($newPath . $relative);

                    $relativeParent = substr($descendant->getParent(), \strlen($path));
                    $descendant->setParent($newPath . $relativeParent);
                }
            }
        }

        $fileIndex->setPath($newPath);
        $fileIndex->setParent(\dirname($newPath));
        $fileIndex->setName(basename($newPath));
        $fileIndex->setUpdatedAt(new DateTimeImmutable());
        $fileIndex->setUpdatedBy($this->securityService->getUser());

        $this->entityManager->persist($fileIndex);

        return $fileIndex;
    }

    public function copy(string $path, string $newPath): FileIndex
    {
        $fileIndex = $this->head($path);

        if (!$this->securityService->canWrite($newPath)) {
            throw new FileForbiddenException('file.access_denied');
        }

        $this->ensureParentExists($newPath);

        $fullPath = $this->toFullPath($path);
        $newFullPath = $this->toFullPath($newPath);

        if (!file_exists($fullPath)) {
            throw new FileException('file.source_not_found');
        }

        $existingTargetIndex = $this->fileIndexRepository->findByPath($newPath);

        if (file_exists($newFullPath)) {
            if (is_dir($newFullPath)) {
                throw new FileException('file.target_is_directory');
            }
            unlink($newFullPath);
        }

        if ($existingTargetIndex) {
            $this->entityManager->remove($existingTargetIndex);
        }

        if (is_dir($fullPath)) {
            $this->copyDirectory($fullPath, $newFullPath);

            $descendants = $this->fileIndexRepository->findAllByParent($path);
            foreach ($descendants as $descendant) {
                if ($descendant->getParent() === $path || str_starts_with($descendant->getParent(), $path . '/')) {
                    $relative = substr($descendant->getPath(), \strlen($path));
                    $newDescendantPath = $newPath . $relative;

                    $newDescendant = $this->copyFileIndex($descendant, $newDescendantPath);
                    $this->entityManager->persist($newDescendant);
                }
            }
        } else {
            copy($fullPath, $newFullPath);
        }

        $newFileIndex = $this->copyFileIndex($fileIndex, $newPath);
        $this->entityManager->persist($newFileIndex);

        return $newFileIndex;
    }

    private function deleteDirectory(string $dir): void
    {
        if (!is_dir($dir)) {
            return;
        }

        $files = array_diff(scandir($dir), ['.', '..']);

        foreach ($files as $file) {
            $path = $dir . '/' . $file;
            (is_dir($path)) ? $this->deleteDirectory($path) : unlink($path);
        }

        rmdir($dir);
    }

    private function copyDirectory(string $source, string $dest): void
    {
        if (!is_dir($dest)) {
            mkdir($dest, 0o755, true);
        }

        $files = array_diff(scandir($source), ['.', '..']);

        foreach ($files as $file) {
            $sourcePath = $source . '/' . $file;
            $destPath = $dest . '/' . $file;

            if (is_dir($sourcePath)) {
                $this->copyDirectory($sourcePath, $destPath);
            } else {
                copy($sourcePath, $destPath);
            }
        }
    }
}
