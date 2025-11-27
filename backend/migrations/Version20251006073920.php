<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20251006073920 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create MfaMethod table';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE SEQUENCE mfa_method_id_seq INCREMENT BY 1 MINVALUE 1 START 1');
        $this->addSql(<<<SQL
            CREATE TABLE mfa_method (
                id INT NOT NULL,
                user_id INT NOT NULL,
                method VARCHAR(255) NOT NULL,
                recipient VARCHAR(255) NOT NULL,
                auth_code VARCHAR(255) DEFAULT NULL,
                priority INT NOT NULL,
                last_code_sent_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL,
                last_code_expires_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL,
                created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
                updated_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
                PRIMARY KEY(id)
            )
            SQL);

        $this->addSql('CREATE INDEX IDX_CEADBD20A76ED395 ON mfa_method (user_id)');

        $this->addSql('COMMENT ON COLUMN mfa_method.last_code_sent_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('COMMENT ON COLUMN mfa_method.last_code_expires_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('COMMENT ON COLUMN mfa_method.created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('COMMENT ON COLUMN mfa_method.updated_at IS \'(DC2Type:datetime_immutable)\'');

        $this->addSql(<<<SQL
            ALTER TABLE mfa_method
                ADD CONSTRAINT FK_CEADBD20A76ED395 FOREIGN KEY (user_id) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE
            SQL);
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP SEQUENCE mfa_method_id_seq CASCADE');
        $this->addSql('ALTER TABLE mfa_method DROP CONSTRAINT FK_CEADBD20A76ED395');
        $this->addSql('DROP TABLE mfa_method');
    }
}
