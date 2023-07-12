import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import cors from '@fastify/cors';

export default fp(async (app: FastifyInstance) => {
	await app.register(cors, {
		origin: '*',
		methods: 'GET,PUT,POST,DELETE,PATCH',
		allowedHeaders: ['Content-Type', 'Authorization'],
		preflightContinue: false,
		optionsSuccessStatus: 204,
	});

	app.log.info('CORS enabled.');
});
