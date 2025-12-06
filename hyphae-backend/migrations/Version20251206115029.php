<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20251206115029 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create FileIndex, Session, and User tables';
    }

    public function up(Schema $schema): void
    {
        $this->addSql(<<<SQL
            CREATE TABLE file_index (
                path VARCHAR(1024) NOT NULL,
                parent VARCHAR(1024) DEFAULT NULL,
                name VARCHAR(1024) NOT NULL,
                content_type VARCHAR(255) NOT NULL,
                is_directory BOOLEAN NOT NULL,
                permissions INTEGER NOT NULL,
                created_at DATETIME NOT NULL,
                updated_at DATETIME NOT NULL,
                created_by_id INTEGER DEFAULT NULL,
                updated_by_id INTEGER DEFAULT NULL,
                PRIMARY KEY (path),
                CONSTRAINT FK_2AF0D736B03A8386 FOREIGN KEY (created_by_id) REFERENCES user (id) NOT DEFERRABLE INITIALLY IMMEDIATE,
                CONSTRAINT FK_2AF0D736896DBBDE FOREIGN KEY (updated_by_id) REFERENCES user (id) NOT DEFERRABLE INITIALLY IMMEDIATE
            )
            SQL);

        $this->addSql('CREATE INDEX IDX_2AF0D736B03A8386 ON file_index (created_by_id)');
        $this->addSql('CREATE INDEX IDX_2AF0D736896DBBDE ON file_index (updated_by_id)');
        $this->addSql('CREATE INDEX IDX_FILE_INDEX_PATH ON file_index (path)');
        $this->addSql('CREATE INDEX IDX_FILE_INDEX_PARENT ON file_index (parent)');
        $this->addSql('CREATE INDEX IDX_FILE_INDEX_NAME ON file_index (name)');

        $this->addSql(<<<SQL
            CREATE TABLE session (
                id BLOB NOT NULL,
                access_token CLOB NOT NULL,
                id_token CLOB NOT NULL,
                refresh_token CLOB NOT NULL,
                scopes CLOB NOT NULL,
                expires_at DATETIME NOT NULL,
                created_at DATETIME NOT NULL,
                updated_at DATETIME NOT NULL,
                user_id INTEGER NOT NULL,
                PRIMARY KEY (id),
                CONSTRAINT FK_D044D5D4D32632E8 FOREIGN KEY (user_id) REFERENCES user (id) NOT DEFERRABLE INITIALLY IMMEDIATE
            )
            SQL);

        $this->addSql('CREATE INDEX IDX_D044D5D4D32632E8 ON session (user_id)');

        $this->addSql(<<<SQL
            CREATE TABLE user (
                id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
                email VARCHAR(180) NOT NULL,
                username VARCHAR(255) NOT NULL,
                image_url CLOB DEFAULT NULL,
                created_at DATETIME NOT NULL,
                updated_at DATETIME NOT NULL
            )
            SQL);
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE file_index');
        $this->addSql('DROP TABLE session');
        $this->addSql('DROP TABLE user');
    }
}
