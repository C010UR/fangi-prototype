<?php

declare(strict_types=1);

namespace App\DependencyInjection;

use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Extension\Extension;

class HyphaeExtension extends Extension
{
    public function load(array $configs, ContainerBuilder $container): void
    {
        $configuration = new HyphaeConfiguration();
        $config = $this->processConfiguration($configuration, $configs);

        $this->configureOAuth($container, $config['oauth']);
    }

    private function configureOAuth(ContainerBuilder $container, array $config): void
    {
        $container->setParameter('hyphae.oauth.server', $config['server']);
        $container->setParameter('hyphae.oauth.client_id', $config['client_id']);
        $container->setParameter('hyphae.oauth.client_secret', $config['client_secret']);
    }

    public function getAlias(): string
    {
        return 'hyphae';
    }
}
