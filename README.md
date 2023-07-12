# Twig Challenge: Orders Service

## Requirements

- [Node.js](https://nodejs.org/en/)
- [MongoDB](https://www.mongodb.com/)
- [Redis](https://redis.io/)
- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

## Installation

```bash
npm install
```

## Usage

```bash
# spin up the necessary infrastructure (wait a bit till it's up)
$ docker compose up -d

# create a development-only environment variables file
$ cp .env.template .env

# sync the database
$ npm run push

# run in development mode
$ npm run dev
```

## License

[See](./LICENSE.md)
