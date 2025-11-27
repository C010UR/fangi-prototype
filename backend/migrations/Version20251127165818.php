<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20251127165818 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create AccountRegistrationRequest table';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE SEQUENCE account_registration_request_id_seq INCREMENT BY 1 MINVALUE 1 START 1');

        $this->addSql(<<<SQL
            CREATE TABLE account_registration_request (
                id INT NOT NULL,
                user_id INT NOT NULL,
                selector VARCHAR(20) NOT NULL,
                token VARCHAR(100) NOT NULL,
                created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
                updated_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
                PRIMARY KEY(id)
            )
            SQL);

        $this->addSql('CREATE INDEX IDX_B2616384A76ED395 ON account_registration_request (user_id)');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_IDENTIFIER_ACCOUNT_REGISTRATION_REQUEST_SELECTOR ON account_registration_request (selector)');

        $this->addSql('COMMENT ON COLUMN account_registration_request.created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('COMMENT ON COLUMN account_registration_request.updated_at IS \'(DC2Type:datetime_immutable)\'');

        $this->addSql(<<<SQL
            ALTER TABLE account_registration_request
                ADD CONSTRAINT FK_B2616384A76ED395 FOREIGN KEY (user_id) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE
            SQL);
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP SEQUENCE account_registration_request_id_seq CASCADE');
        $this->addSql('ALTER TABLE account_registration_request DROP CONSTRAINT FK_B2616384A76ED395');
        $this->addSql('DROP TABLE account_registration_request');
    }
}
