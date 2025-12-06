<?php

declare(strict_types=1);

namespace App;

use App\DependencyInjection\HyphaeExtension;
use Symfony\Component\DependencyInjection\Extension\ExtensionInterface;
use Symfony\Component\HttpKernel\Bundle\Bundle;

class HyphaeBundle extends Bundle
{
    public function getContainerExtension(): ?ExtensionInterface
    {
        return new HyphaeExtension();
    }
}
