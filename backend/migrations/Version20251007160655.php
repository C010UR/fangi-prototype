<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20251007160655 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create PasswordResetRequest table';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE SEQUENCE password_reset_request_id_seq INCREMENT BY 1 MINVALUE 1 START 1');

        $this->addSql(<<<SQL
            CREATE TABLE password_reset_request (
                id INT NOT NULL,
                user_id INT NOT NULL,
                selector VARCHAR(20) NOT NULL,
                token VARCHAR(100) NOT NULL,
                expires_at TIMESTAMP(0) WITHOUT TIME ZONE,
                created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
                updated_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
                PRIMARY KEY(id)
            )
            SQL);

        $this->addSql('CREATE INDEX IDX_C5D0A95AA76ED395 ON password_reset_request (user_id)');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_IDENTIFIER_PASSWORD_RESET_REQUEST_SELECTOR ON password_reset_request (selector)');

        $this->addSql('COMMENT ON COLUMN password_reset_request.expires_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('COMMENT ON COLUMN password_reset_request.created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('COMMENT ON COLUMN password_reset_request.updated_at IS \'(DC2Type:datetime_immutable)\'');

        $this->addSql(<<<SQL
            ALTER TABLE password_reset_request
                ADD CONSTRAINT FK_C5D0A95AA76ED395 FOREIGN KEY (user_id) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE
            SQL);
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP SEQUENCE password_reset_request_id_seq CASCADE');
        $this->addSql('ALTER TABLE password_reset_request DROP CONSTRAINT FK_C5D0A95AA76ED395');
        $this->addSql('DROP TABLE password_reset_request');
    }
}
