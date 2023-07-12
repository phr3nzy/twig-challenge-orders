import type { FastifyInstance } from 'fastify';

export default async function orderRoutes(app: FastifyInstance) {
	app.log.info('Order routes registered.');
}
