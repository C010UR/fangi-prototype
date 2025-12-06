<?php

declare(strict_types=1);

namespace App;

use App\DependencyInjection\MyceliumExtension;
use Symfony\Component\DependencyInjection\Extension\ExtensionInterface;
use Symfony\Component\HttpKernel\Bundle\Bundle;

class MyceliumBundle extends Bundle
{
    public function getContainerExtension(): ?ExtensionInterface
    {
        return new MyceliumExtension();
    }
}
