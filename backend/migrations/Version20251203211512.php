<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20251203211512 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create AccessToken, AuthorizationCode, IDToken, and RefreshToken tables';
    }

    public function up(Schema $schema): void
    {
        $this->addSql(<<<SQL
            CREATE TABLE access_token (
                token TEXT NOT NULL,
                user_id INT NOT NULL,
                server_id INT NOT NULL,
                scopes JSON NOT NULL,
                token_type VARCHAR(255) NOT NULL,
                audience JSON NOT NULL,
                expires_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
                created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
                updated_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
                PRIMARY KEY(token)
            )
            SQL);

        $this->addSql('CREATE INDEX IDX_B6A2DD68A76ED395 ON access_token (user_id)');
        $this->addSql('CREATE INDEX IDX_B6A2DD681844E6B7 ON access_token (server_id)');

        $this->addSql('COMMENT ON COLUMN access_token.expires_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('COMMENT ON COLUMN access_token.created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('COMMENT ON COLUMN access_token.updated_at IS \'(DC2Type:datetime_immutable)\'');

        $this->addSql(<<<SQL
            CREATE TABLE authorization_code (
                token TEXT NOT NULL,
                user_id INT NOT NULL,
                server_id INT NOT NULL,
                scopes JSON NOT NULL,
                state TEXT NOT NULL,
                nonce VARCHAR(255) NOT NULL,
                redirect_uri TEXT NOT NULL,
                expires_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
                created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
                updated_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
                PRIMARY KEY(token)
            )
            SQL);

        $this->addSql('CREATE INDEX IDX_2F33E8B8A76ED395 ON authorization_code (user_id)');
        $this->addSql('CREATE INDEX IDX_2F33E8B81844E6B7 ON authorization_code (server_id)');

        $this->addSql('COMMENT ON COLUMN authorization_code.expires_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('COMMENT ON COLUMN authorization_code.created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('COMMENT ON COLUMN authorization_code.updated_at IS \'(DC2Type:datetime_immutable)\'');

        $this->addSql(<<<SQL
            CREATE TABLE idtoken (
                token TEXT NOT NULL,
                user_id INT NOT NULL,
                server_id INT NOT NULL,
                expires_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
                created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
                updated_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
                PRIMARY KEY(token)
            )
            SQL);

        $this->addSql('CREATE INDEX IDX_8932CD22A76ED395 ON idtoken (user_id)');
        $this->addSql('CREATE INDEX IDX_8932CD221844E6B7 ON idtoken (server_id)');

        $this->addSql('COMMENT ON COLUMN idtoken.expires_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('COMMENT ON COLUMN idtoken.created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('COMMENT ON COLUMN idtoken.updated_at IS \'(DC2Type:datetime_immutable)\'');

        $this->addSql(<<<SQL
            CREATE TABLE refresh_token (
                token TEXT NOT NULL,
                user_id INT NOT NULL,
                server_id INT NOT NULL,
                scopes JSON NOT NULL,
                expires_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
                created_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
                updated_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL,
                PRIMARY KEY(token)
            )
            SQL);

        $this->addSql('CREATE INDEX IDX_C74F2195A76ED395 ON refresh_token (user_id)');
        $this->addSql('CREATE INDEX IDX_C74F21951844E6B7 ON refresh_token (server_id)');

        $this->addSql('COMMENT ON COLUMN refresh_token.expires_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('COMMENT ON COLUMN refresh_token.created_at IS \'(DC2Type:datetime_immutable)\'');
        $this->addSql('COMMENT ON COLUMN refresh_token.updated_at IS \'(DC2Type:datetime_immutable)\'');

        $this->addSql(<<<SQL
            ALTER TABLE access_token
                ADD CONSTRAINT FK_B6A2DD68A76ED395 FOREIGN KEY (user_id) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE,
                ADD CONSTRAINT FK_B6A2DD681844E6B7 FOREIGN KEY (server_id) REFERENCES server (id) NOT DEFERRABLE INITIALLY IMMEDIATE
            SQL);

        $this->addSql(<<<SQL
            ALTER TABLE authorization_code
                ADD CONSTRAINT FK_2F33E8B8A76ED395 FOREIGN KEY (user_id) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE,
                ADD CONSTRAINT FK_2F33E8B81844E6B7 FOREIGN KEY (server_id) REFERENCES server (id) NOT DEFERRABLE INITIALLY IMMEDIATE
            SQL);

        $this->addSql(<<<SQL
            ALTER TABLE idtoken
                ADD CONSTRAINT FK_8932CD22A76ED395 FOREIGN KEY (user_id) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE,
                ADD CONSTRAINT FK_8932CD221844E6B7 FOREIGN KEY (server_id) REFERENCES server (id) NOT DEFERRABLE INITIALLY IMMEDIATE
            SQL);

        $this->addSql(<<<SQL
            ALTER TABLE refresh_token
                ADD CONSTRAINT FK_C74F2195A76ED395 FOREIGN KEY (user_id) REFERENCES "user" (id) NOT DEFERRABLE INITIALLY IMMEDIATE,
                ADD CONSTRAINT FK_C74F21951844E6B7 FOREIGN KEY (server_id) REFERENCES server (id) NOT DEFERRABLE INITIALLY IMMEDIATE
            SQL);
    }

    public function down(Schema $schema): void
    {
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE access_token DROP CONSTRAINT FK_B6A2DD68A76ED395');
        $this->addSql('ALTER TABLE access_token DROP CONSTRAINT FK_B6A2DD681844E6B7');
        $this->addSql('ALTER TABLE authorization_code DROP CONSTRAINT FK_2F33E8B8A76ED395');
        $this->addSql('ALTER TABLE authorization_code DROP CONSTRAINT FK_2F33E8B81844E6B7');
        $this->addSql('ALTER TABLE idtoken DROP CONSTRAINT FK_8932CD22A76ED395');
        $this->addSql('ALTER TABLE idtoken DROP CONSTRAINT FK_8932CD221844E6B7');
        $this->addSql('ALTER TABLE refresh_token DROP CONSTRAINT FK_C74F2195A76ED395');
        $this->addSql('ALTER TABLE refresh_token DROP CONSTRAINT FK_C74F21951844E6B7');
        $this->addSql('DROP TABLE access_token');
        $this->addSql('DROP TABLE authorization_code');
        $this->addSql('DROP TABLE idtoken');
        $this->addSql('DROP TABLE refresh_token');
    }
}
