<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\AuthorizationCode;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<AuthorizationCode>
 */
class AuthorizationCodeRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, AuthorizationCode::class);
    }

    public function findOneByToken(string $token): ?AuthorizationCode
    {
        return $this->createQueryBuilder('authorization_code')
            ->andWhere('authorization_code.token = :token')
            ->setParameter('token', $token)
            ->getQuery()
            ->getOneOrNullResult();
    }
}
