<?php

declare(strict_types=1);
use PhpCsFixer\Config;
use PhpCsFixer\Finder;
use PhpCsFixer\Runner\Parallel\ParallelConfigFactory;

if (!file_exists(__DIR__ . '/src')) {
    exit(0);
}

return new Config()
    ->setParallelConfig(ParallelConfigFactory::detect())
    ->setRules([
        '@DoctrineAnnotation' => true,
        '@Symfony' => true,
        '@Symfony:risky' => true,
        '@PHP84Migration' => true,
        '@PER-CS2.0' => true,
        '@PER-CS2.0:risky' => true,
        'declare_strict_types' => true,
        'strict_comparison' => true,
        'strict_param' => true,
        'cast_spaces' => [
            'space' => 'none',
        ],
        'fully_qualified_strict_types' => [
            'import_symbols' => true,
            'leading_backslash_in_global_namespace' => false,
        ],
        'global_namespace_import' => [
            'import_classes' => true,
            'import_constants' => false,
            'import_functions' => false,
        ],
        'ordered_imports' => [
            'case_sensitive' => false,
            'sort_algorithm' => 'alpha',
        ],
        'single_line_empty_body' => false,
    ])
    ->setFinder(
        new Finder()
            ->in(__DIR__ . '/src')
            ->in(__DIR__ . '/migrations')
            ->append([__FILE__]),
    )
    ->setRiskyAllowed(true);
