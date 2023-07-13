import type { FastifyInstance } from 'fastify';

import metadataRoute from './metadata.js';
import ordersRoutes from './orders.js';

export default async function routes(app: FastifyInstance) {
	await app.register(metadataRoute);
	await app.register(ordersRoutes, { prefix: '/orders' });
}
