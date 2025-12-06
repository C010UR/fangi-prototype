<?php

declare(strict_types=1);

namespace App\DataFixtures;

use App\Entity\FileIndex;
use App\Service\FileService;
use Doctrine\Persistence\ObjectManager;

class FileFixture extends AbstractFixture
{
    public function __construct(
        private FileService $fileService,
    ) {
        parent::__construct();
    }

    public function load(ObjectManager $manager): void
    {
        $this->fileService->initializeFolder();

        $this->generateLevel($manager, '/', 1, 10, 100, 100);
        $manager->flush();
    }

    private function generateLevel(
        ObjectManager $manager,
        string $parent,
        int $currentLevel,
        int $maxLevels,
        int $filesPerLevel,
        int $foldersPerLevel,
    ): void {
        for ($i = 0; $i < $filesPerLevel; ++$i) {
            $name = strtolower($this->faker->word()) . '-' . $this->faker->numberBetween(10000, 99999) . '.txt';
            $this->createFile($manager, $this->faker->text(1024), $name, $parent);
        }

        if ($currentLevel < $maxLevels) {
            for ($i = 0; $i < $foldersPerLevel; ++$i) {
                $name = strtolower($this->faker->word()) . '-' . $this->faker->numberBetween(10000, 99999);
                $directory = $this->createDirectory($manager, $name, $parent);
                $this->generateLevel($manager, $directory->getPath(), $currentLevel + 1, $maxLevels, 5, 1);
            }
        }
    }

    private function createDirectory(ObjectManager $manager, string $name, string $parent = '/'): FileIndex
    {
        $path = '/' === $parent ? '/' . $name : $parent . '/' . $name;
        $fullPath = $this->fileService->getUploadsDir() . $path;

        if (!is_dir($fullPath)) {
            mkdir($fullPath, 0o777, true);
        }

        $fileIndex = new FileIndex()
            ->setPath($path)
            ->setParent($parent)
            ->setName($name)
            ->setContentType('directory')
            ->setIsDirectory(true)
            ->setPermissions(0o777);

        $manager->persist($fileIndex);

        return $fileIndex;
    }

    private function createFile(ObjectManager $manager, string $text, string $name, string $parent = '/'): FileIndex
    {
        $path = '/' === $parent ? '/' . $name : $parent . '/' . $name;
        $fullPath = $this->fileService->getUploadsDir() . $path;

        file_put_contents($fullPath, $text);

        $fileIndex = new FileIndex()
            ->setPath($path)
            ->setParent($parent)
            ->setName($name)
            ->setContentType('text/plain')
            ->setIsDirectory(false)
            ->setPermissions(0o777);

        $manager->persist($fileIndex);

        return $fileIndex;
    }
}
