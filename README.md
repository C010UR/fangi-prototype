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

This project uses OpenAPI for API documentation, the UI be accessed with [http://localhost:8000/api/doc](http://localhost:8000/api/doc).

The _JSON_ representation of the OpenAPI documentation can be found at [http://localhost:8000/api/doc.json](http://localhost:8000/api/doc.json).

## Essential commands

Common commands used in development should be put into `Makefile`. This will help all developers with working on the project.

To see available `Makefile` commands simply run:

```sh
make
```

### Frontend

> [!important]
> For the next commands to work containers must be running.

This project contains 2 frontend subprojects: __Mycelium__ (auth server) and __Sporae__ (file explorer).

To run npm in the container run `bin/mycelium-npm` or `bin/sporae-npm`, e.g.: `bin/mycelium-npm run build`.

### Backend

> [!important]
> For the next commands to work containers must be running.

This project contains 2 backend subprojects: __Mycelium__ (auth server) and __Hyphae__ (file server).

To run `php` binary in the container run `bin/mycelium-php` or `bin/hyphae-php`, e.g.: `bin/mycelium-php --version`.

To run `php bin/console` in the container run `bin/mycelium-run` or `bin/hyphae-run`, e.g.: `bin/run doctrine:migrations:migrate`.

to run `composer` binary in the container run `bin/mycelium-composer` or `bin/hyphae-composer`, e.g.: `bin/composer install`.

## Configuration

> [!important]
> For better development experience it is recommended to add `127.0.0.1 host.docker.internal` to your `/etc/hosts` file.

To configure the __Hyphae__ (file server) as an OAuth client modify values in the `hyphae-backend/config/packages/hyphae.yaml`.

```yaml
hyphae:
  oauth:
    # server: "%env(resolve:HYPHAE_OAUTH_SERVER)%"
    # client_id: "%env(resolve:HYPHAE_OAUTH_CLIENT_ID)%"
    # client_secret: "%env(resolve:HYPHAE_OAUTH_CLIENT_SECRET)%"
    server: "http://host.docker.internal:8000"
    client_id: "<client_id_goes_here>"
    client_secret: "<client_secret_goes_here>"
```

To configure the __Sporae__ (external module) as an OAuthe client, modify values in the `sporae-frontend/src/lib/sporae.ts`, e.g.

```js
const sporaeClient = new Sporae({
  // clientId: import.meta.env.VITE_SPORAE_CLIENT_ID || '',
  // baseUri: import.meta.env.VITE_SPORAE_BASE_URI || '',
  // redirectUri: import.meta.env.VITE_SPORAE_REDIRECT_URI || '',
  clientId: '<client_id_goes_here>',
  baseUri: 'http://host.docker.internal:10000',
  redirectUri: 'http://host.docker.internal:10000/oauth/callback',
  authServerUri: 'http://host.docker.internal:8001/oauth/authorize',
});
```
