<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20250930123505 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Database setup';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE EXTENSION pg_trgm');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP EXTENSION pg_trgm');
    }
}
