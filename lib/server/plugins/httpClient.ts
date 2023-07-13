import axios, { Axios } from 'axios';
import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';

declare module 'fastify' {
	interface FastifyInstance {
		httpClient: Axios;
	}
}

export default fp(async (app: FastifyInstance) => {
	app.decorate('httpClient', axios.create());
});
