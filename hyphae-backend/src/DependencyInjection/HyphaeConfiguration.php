<?php

declare(strict_types=1);

namespace App\DependencyInjection;

use Symfony\Component\Config\Definition\Builder\TreeBuilder;
use Symfony\Component\Config\Definition\ConfigurationInterface;

class HyphaeConfiguration implements ConfigurationInterface
{
    public function getConfigTreeBuilder(): TreeBuilder
    {
        $treeBuilder = new TreeBuilder('hyphae');

        $treeBuilder->getRootNode()
            ->children()
                ->arrayNode('oauth')
                    ->addDefaultsIfNotSet()
                    ->children()
                        ->scalarNode('server')
                            ->defaultValue('https://oauth.hyphae.io')
                            ->info('OAuth server URL')
                        ->end()
                        ->scalarNode('client_id')
                            ->defaultValue('hyphae-client')
                            ->info('OAuth client ID')
                        ->end()
                        ->scalarNode('client_secret')
                            ->defaultValue('hyphae-client-secret')
                            ->info('OAuth client secret')
                        ->end()
                    ->end()
                ->end()
            ->end();

        return $treeBuilder;
    }
}
