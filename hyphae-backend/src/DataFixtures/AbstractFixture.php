<?php

declare(strict_types=1);

namespace App\DataFixtures;

use Doctrine\Bundle\FixturesBundle\Fixture;
use Faker\Factory as FakerFactory;
use Faker\Generator as FakerGenerator;

abstract class AbstractFixture extends Fixture
{
    protected FakerGenerator $faker;

    public function __construct()
    {
        $this->faker = FakerFactory::create();
    }
}
