<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\FileIndex;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<FileIndex>
 */
class FileIndexRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, FileIndex::class);
    }

    public function findByPath(string $path): ?FileIndex
    {
        return $this->createQueryBuilder('f')
            ->andWhere('f.path = :path')
            ->setParameter('path', $path)
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function findDirectChildrenByParent(string $parent): array
    {
        return $this->createQueryBuilder('f')
            ->andWhere('f.parent = :parent')
            ->setParameter('parent', $parent)
            ->getQuery()
            ->getResult();
    }

    public function findAllByParent(string $parent): array
    {
        return $this->createQueryBuilder('f')
            ->andWhere('f.parent LIKE :parent')
            ->setParameter('parent', $parent . '%')
            ->getQuery()
            ->getResult();
    }
}
