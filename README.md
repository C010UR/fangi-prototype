# Fangi Mycelium

Fangi Mycelium is an Authentication and Authorization platform for Fangi ecosystem.

## Requirements

* [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/) as deployment environment.
* [Makefile](https://makefiletutorial.com/) to run project-related commands.

## Getting started

Clone Repository:
To get started just clone the repository and start the project by running:

```sh
make init
```

## API Documentation

This project uses OpenAPI for API documentation, the UI be accessed with [http://localhost:8000](http://localhost:8000).

The _JSON_ representation of the OpenAPI documentation can be found at [http://localhost:8001/api/doc.json](http://localhost:8001/api/doc.json).

## Essential commands

Common commands used in development should be put into `Makefile`. This will help all developers with working on the project.

To see available `Makefile` commands simply run:

```sh
make
```

### Frontend

> [!important]
> For the next commands to work containers must be running.

To run npm in the container run `bin/pnpm`, e.g.: `bin/npm run build`.

### Backend

> [!important]
> For the next commands to work containers must be running.

To run `php` binary in the container run `bin/php`, e.g.: `bin/php --version`.

To run `php bin/console` in the container run `bin/run`, e.g.: `bin/run doctrine:migrations:migrate`.

to run `composer` binary in the container run `bin/composer`, e.g.: `bin/composer install`.
