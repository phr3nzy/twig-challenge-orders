// Main entrypoint for the server
import sensible from '@fastify/sensible';
import fastify from 'fastify';
import { SERVER_CONFIG } from './config/server.js';
import env from './plugins/config.js';
import db from './plugins/db.js';
import health from './plugins/health.js';
import swagger from './plugins/swagger.js';
import validator from './plugins/validator.js';
import queue from './plugins/queue.js';
import cors from './plugins/cors.js';

export const bootstrap = async () => {
	const server = fastify(SERVER_CONFIG);

	// Register plugins
	// validator plugin will add ajv and fluent-json-schema support
	await server.register(validator);
	// env plugin will validate environment variables
	await server.register(env);
	// sensible plugin will add some sensible defaults (404, 500, etc.)
	await server.register(sensible);
	// cors plugin will add cors support
	await server.register(cors);
	// swagger plugin will add swagger support
	await server.register(swagger);
	// db plugin will add database support
	await server.register(db);
	// queue plugin will add queue support using amqplib (RabbitMQ)
	await server.register(queue);
	// health plugin will add health check support
	await server.register(health);

	// Register routes
	await server.register(import('./routes/index.js'));

	return server;
};
