<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\PasswordResetRequest;
use App\Entity\User;
use DateTimeImmutable;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<PasswordResetRequest>
 */
class PasswordResetRequestRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, PasswordResetRequest::class);
    }

    public function findOneBySelector(string $selector): ?PasswordResetRequest
    {
        return $this->createQueryBuilder('request')
            ->select('request', 'user')
            ->leftJoin('request.user', 'user')
            ->andWhere('request.selector = :selector')
            ->setParameter('selector', $selector)
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function findLastByUser(User $user): ?PasswordResetRequest
    {
        return $this->createQueryBuilder('request')
            ->select('request', 'user')
            ->leftJoin('request.user', 'user')
            ->andWhere('request.user= :user')
            ->setParameter('user', $user)
            ->orderBy('request.createdAt', 'desc')
            ->setMaxResults(1)
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function purgeExpiredRequests(): void
    {
        $this->createQueryBuilder('request')
            ->delete()
            ->andWhere('request.expiresAt IS NOT NULL')
            ->andWhere('request.expiresAt < :now')
            ->setParameter('now', new DateTimeImmutable())
            ->getQuery()
            ->execute();
    }
}
