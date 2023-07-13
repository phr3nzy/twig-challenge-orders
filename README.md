# Twig Challenge: Orders Service

## Description

The project is a RESTful API for managing orders. It uses RabbitMQ for communication between services.

## Structure

```bash
.
├── .github # Github specific files (dependabot, workflows... etc.)
├── .husky # husky dir (Readonly)
├── lib
│   └── server # contains the main files for the backend
│       ├── config # stores configurations (server, logger, env vars... etc.)
│       ├── plugins # Custom plugins for fastify (auth, security, cache, db... etc.)
│       ├── routes # main routes
│       └── services # contains the services (event handlers)
├── prisma # prisma dir
└── tests # written tests go here
```

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
# install dependencies
$ npm install --legacy-peer-deps

# spin up the necessary infrastructure (wait a bit till it's up)
$ docker compose up -d

# create a development-only environment variables file
$ cp .env.template .env

# sync the database
$ npm run push

# run in development mode
$ npm run dev

# running tests
$ docker compose -f docker-compose.test.yml up --build --exit-code-from orders-service
```
