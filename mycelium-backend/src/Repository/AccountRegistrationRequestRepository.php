<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\AccountRegistrationRequest;
use App\Entity\User;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<AccountRegistrationRequest>
 */
class AccountRegistrationRequestRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, AccountRegistrationRequest::class);
    }

    public function findOneBySelector(string $selector): ?AccountRegistrationRequest
    {
        return $this->createQueryBuilder('request')
            ->select('request', 'user')
            ->leftJoin('request.user', 'user')
            ->andWhere('request.selector = :selector')
            ->setParameter('selector', $selector)
            ->getQuery()
            ->getOneOrNullResult();
    }

    public function findLastByUser(User $user): ?AccountRegistrationRequest
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
}
