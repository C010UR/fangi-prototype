# Executables
DOCKER         = docker
DOCKER_COMPOSE = docker compose
DOCKER_BUILD   = docker build

# Docker containers
MYCELIUM_BACKEND_CONT = $(DOCKER_COMPOSE) exec mycelium-api
MYCELIUM_FRONTEND_CONT = $(DOCKER_COMPOSE) exec mycelium-frontend
HYPHAE_BACKEND_CONT = $(DOCKER_COMPOSE) exec hyphae-api
SPORAE_FRONTEND_CONT = $(DOCKER_COMPOSE) exec sporae-frontend

# Executables
MYCELIUM_PHP      = $(MYCELIUM_BACKEND_CONT) php
MYCELIUM_NPM      = $(MYCELIUM_FRONTEND_CONT) npm
MYCELIUM_COMPOSER = $(MYCELIUM_BACKEND_CONT) composer
MYCELIUM_SYMFONY  = $(MYCELIUM_BACKEND_CONT) php bin/console
HYPHAE_PHP      = $(HYPHAE_BACKEND_CONT) php
HYPHAE_COMPOSER = $(HYPHAE_BACKEND_CONT) composer
HYPHAE_SYMFONY  = $(HYPHAE_BACKEND_CONT) php bin/console
SPORAE_NPM      = $(SPORAE_FRONTEND_CONT) npm

# Misc
.DEFAULT_GOAL = help

USER_ID = $(shell id -u)
GROUP_ID = $(shell id -g)

export USER_ID
export GROUP_ID

## ——  Makefile  ———————————————————————————————————————————————————————————————————————————————————————————————————————
.PHONY: help
help: ## Output this help message
	@grep -E '(^[a-zA-Z0-9\./_-]+:.*?##.*$$)|(^##)' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}{printf "\033[32m%-30s\033[0m %s\n", $$1, $$2}' | sed -e 's/\[32m##/[33m\n/'

## ——  Docker  —————————————————————————————————————————————————————————————————————————————————————————————————————————
.PHONY: init
init: copy-env down build vendor cc cw database-reset ## Initialize Fangi Mycelium

.PHONY: copy-env
copy-env:
	@ cp .env .env.local

.PHONY: restart
restart: ## Restart Fangi Mycelium project
	@ $(DOCKER_COMPOSE) restart app

.PHONY: up
up: ## Start Fangi Mycelium containers
	@ $(DOCKER_COMPOSE) up -d

.PHONY: build
build: ## Build Fangi Mycelium containers
	@ $(DOCKER_COMPOSE) up -d --build

.PHONY: down
down: ## Stop Fangi Myceliumcontainers
	@ $(DOCKER_COMPOSE) down

.PHONY: mycelium-backend
mycelium-backend: ## Connect to the Mycelium container
	@ $(MYCELIUM_BACKEND_CONT) fish

.PHONY: mycelium-frontend
mycelium-frontend: ## Connect to the Mycelium frontend container
	@ $(MYCELIUM_FRONTEND_CONT) sh

.PHONY: hyphae-backend
hyphae-backend: ## Connect to the Hyphae container
	@ $(HYPHAE_BACKEND_CONT) fish

.PHONY: sporae-frontend
sporae-frontend: ## Connect to the Sporae frontend container
	@ $(SPORAE_FRONTEND_CONT) sh

## ——  Mycelium  ———————————————————————————————————————————————————————————————————————————————————————————————————————
.PHONY: mycelium-cc
mycelium-cc: ## Cache clear
	@ $(MYCELIUM_SYMFONY) cache:clear

.PHONY: mycelium-cw
mycelium-cw: ## Cache warmup
	@ $(MYCELIUM_SYMFONY) cache:warmup

.PHONY: mycelium-migrations-migrate
mycelium-migrations-migrate: ## Run database migrations
	@ $(MYCELIUM_SYMFONY) doctrine:migrations:migrate --no-interaction

.PHONY: mycelium-migrations-reset
mycelium-migrations-reset: ## Reset database migrations
	@ $(MYCELIUM_SYMFONY) doctrine:migrations:migrate first --no-interaction

.PHONY: mycelium-fixtures-load
mycelium-fixtures-load: ## Load database fixtures
	@ $(MYCELIUM_SYMFONY) doctrine:fixtures:load --no-interaction

.PHONY: mycelium-database-reset
mycelium-database-reset: mycelium-migrations-reset mycelium-migrations-migrate mycelium-fixtures-load ## Drop database, rerun migrations and load fixtures

## ——  Hyphae  —————————————————————————————————————————————————————————————————————————————————————————————————————————
.PHONY: hyphae-cc
hyphae-cc: ## Cache clear
	@ $(HYPHAE_SYMFONY) cache:clear

.PHONY: hyphae-cw
hyphae-cw: ## Cache warmup
	@ $(HYPHAE_SYMFONY) cache:warmup

.PHONY: hyphae-migrations-migrate
hyphae-migrations-migrate: ## Run database migrations
	@ $(HYPHAE_SYMFONY) doctrine:migrations:migrate --no-interaction

.PHONY: hyphae-migrations-reset
hyphae-migrations-reset: ## Reset database migrations
	@ $(HYPHAE_SYMFONY) doctrine:migrations:migrate first --no-interaction

.PHONY: hyphae-data-delete
hyphae-data-delete: ## Delete data
	@ $(HYPHAE_BACKEND_CONT) rm -rf var/hyphae/data

.PHONY: hyphae-fixtures-load
hyphae-fixtures-load: ## Load database fixtures
	@ $(HYPHAE_SYMFONY) doctrine:fixtures:load --no-interaction

.PHONY: hyphae-database-reset
hyphae-database-reset: hyphae-migrations-reset hyphae-migrations-migrate hyphae-data-delete hyphae-fixtures-load ## Drop database, rerun migrations and load fixtures

## ——  Shared Commands  ————————————————————————————————————————————————————————————————————————————————————————————————
.PHONY: mycelium-vendor
mycelium-vendor: ## Install Mycelium composer dependencies
	@ $(MYCELIUM_COMPOSER) install --optimize-autoloader --ignore-platform-reqs

.PHONY: hyphae-vendor
hyphae-vendor: ## Install Hyphae composer dependencies
	@ $(HYPHAE_COMPOSER) install --optimize-autoloader --ignore-platform-reqs

.PHONY: lint
lint: ## Lint the project using php-cs-fixer
	@ PHP_CS_FIXER_IGNORE_ENV=1 $(MYCELIUM_COMPOSER) run php-cs-fixer-lint
	@ PHP_CS_FIXER_IGNORE_ENV=1 $(HYPHAE_COMPOSER) run php-cs-fixer-lint
	@ $(MYCELIUM_NPM) run format:check
	@ $(SPORAE_NPM) run format:check
	@ $(MYCELIUM_NPM) run lint:check
	@ $(SPORAE_NPM) run lint:check

.PHONY: lint-fix
lint-fix: ## Lint and fix issues of the project using php-cs-fixer
	@ PHP_CS_FIXER_IGNORE_ENV=1 $(MYCELIUM_COMPOSER) run php-cs-fixer-fix
	@ PHP_CS_FIXER_IGNORE_ENV=1 $(HYPHAE_COMPOSER) run php-cs-fixer-fix
	@ $(MYCELIUM_NPM) run format
	@ $(SPORAE_NPM) run format
	@ $(MYCELIUM_NPM) run lint
	@ $(SPORAE_NPM) run lint

## ——  Queue  ——————————————————————————————————————————————————————————————————————————————————————————————————————————
.PHONY: mycelium-queue
mycelium-queue: ## Start specified queue, example: make mycelium-queue c=mail
	@ $(eval c ?=)
	@ echo "\033[33mStarting $(c) consumer...\033[0m"
	@ $(MYCELIUM_SYMFONY) sqs:$(c):consumer -v
