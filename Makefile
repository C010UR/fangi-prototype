# Executables
DOCKER         = docker
DOCKER_COMPOSE = docker compose
DOCKER_BUILD   = docker build

# Docker containers
APP_CONT = $(DOCKER_COMPOSE) exec api
NODE_CONT = $(DOCKER_COMPOSE) exec frontend

# Executables
PHP      = $(APP_CONT) php
NPM      = $(NODE_CONT) npm
COMPOSER = $(APP_CONT) composer
SYMFONY  = $(APP_CONT) php bin/console

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

.PHONY: php
php: ## Connect to the App container
	@ $(APP_CONT) fish

## ——  App  ————————————————————————————————————————————————————————————————————————————————————————————————————————————
.PHONY: cc
cc: ## Cache clear
	@ $(SYMFONY) cache:clear

.PHONY: cw
cw: ## Cache warmup
	@ $(SYMFONY) cache:warmup

.PHONY: migrations-migrate
migrations-migrate: ## Run database migrations
	@ $(SYMFONY) doctrine:migrations:migrate --no-interaction

.PHONY: migrations-reset
migrations-reset: ## Reset database migrations
	@ $(SYMFONY) doctrine:migrations:migrate first --no-interaction

.PHONY: fixtures-load
fixtures-load: ## Load database fixtures
	@ $(SYMFONY) doctrine:fixtures:load --no-interaction

.PHONY: database-reset
database-reset: migrations-reset migrations-migrate fixtures-load ## Rerun migrations and load fixtures

## ——  Composer  ———————————————————————————————————————————————————————————————————————————————————————————————————————
.PHONY: composer
composer: ## Run composer, pass the parameter "c=" to run a given command, example: make composer c='req symfony/orm-pack'
	@ $(eval c ?=)
	@ $(COMPOSER) $(c)

.PHONY: vendor
vendor: ## Install composer dependencies
	@ $(COMPOSER) install --optimize-autoloader --ignore-platform-reqs

.PHONY: lint
lint: ## Lint the project using php-cs-fixer
	@ PHP_CS_FIXER_IGNORE_ENV=1 $(COMPOSER) run php-cs-fixer-lint
	@ $(NPM) run lint:check
	@ $(NPM) run format:check

.PHONY: lint-fix
lint-fix: ## Lint and fix issues of the project using php-cs-fixer
	@ PHP_CS_FIXER_IGNORE_ENV=1 $(COMPOSER) run php-cs-fixer-fix
	@ $(NPM) run format
	@ $(NPM) run lint

## ——  Symfony  ————————————————————————————————————————————————————————————————————————————————————————————————————————
.PHONY: symfony
symfony: ## Run bin/console, pass the parameter "c=" to run a given command, example: make symfony c=about
	@ $(eval c ?=)
	@ $(SYMFONY) $(c)

## NPM   ———————————————————————————————————————————————————————————————————————————————————————————————————————————————
.PHONY: npm
npm: ## Run npm, pass the parameter "c=" to run a given command, example: make npm c=i
	@ $(eval c ?=)
	@ $(NPM) $(c)

## ——  Queue  ——————————————————————————————————————————————————————————————————————————————————————————————————————————
.PHONY: queue
queue: ## Start specified queue, example: make queue c=registration-pc-module
	@ $(eval c ?=)
	@ echo "\033[33mStarting $(c) consumer...\033[0m"
	@ $(SYMFONY) sqs:$(c):consumer -v

## ——  Symfony Commands  ———————————————————————————————————————————————————————————————————————————————————————————————
