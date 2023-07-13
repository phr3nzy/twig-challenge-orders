import axios from 'axios';
import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';

declare module 'fastify' {
	interface FastifyInstance {
		httpClient: typeof axios;
	}
}

export default fp(async (app: FastifyInstance) => {
	app.decorate('httpClient', axios);
});
