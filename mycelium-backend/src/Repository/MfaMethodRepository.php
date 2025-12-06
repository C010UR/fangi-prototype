<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\MfaMethod;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<MfaMethod>
 */
class MfaMethodRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, MfaMethod::class);
    }
}
