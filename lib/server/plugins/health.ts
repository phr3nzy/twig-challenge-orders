import underPressure from '@fastify/under-pressure';
import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';

export default fp(
	async (app: FastifyInstance) => {
		await app.register(underPressure, {
			exposeStatusRoute: {
				routeOpts: {
					logLevel: app.config.LOG_LEVEL,
				},
				routeSchemaOpts: {
					tags: ['General'],
					description: 'Ensures the service is healthy by invoking the DB.',
					summary: 'Runs a Health check.',
				},
				routeResponseSchemaOpts: {
					status: { type: 'string', default: 'ok' },
					metrics: {
						type: 'object',
						properties: {
							eventLoopDelay: { type: 'number' },
							rssBytes: { type: 'number' },
							heapUsed: { type: 'number' },
							eventLoopUtilized: { type: 'number' },
						},
					},
				},
				url: '/health',
			},
			healthCheck: async () => {
				try {
					const dbPing = (await app.db.$runCommandRaw({ ping: 1 })) as {
						ok: number;
					};
					const dbIsAlive = dbPing.ok === 1;

					const channel = await app.queue.channel.assertQueue('health-check');

					app.queue.channel.sendToQueue(
						channel.queue,
						Buffer.from('health-check'),
					);

					const queueIsAlive = await app.queue.channel.get(channel.queue);

					if (!queueIsAlive) {
						app.log.error('Queue is unreachable');
						return false;
					}

					if (!dbIsAlive) {
						app.log.error('Database is unreachable');
						return false;
					}

					return {
						status: 'ok',
						metrics: app.memoryUsage(),
					};
				} catch (error) {
					app.log.error(
						error,
						'An error occurred while attempting to run a health check.',
					);
					return false;
				}
			},
			healthCheckInterval: 3000, // Every 3 seconds
		});
	},
	{
		name: 'health',
		dependencies: ['config', 'db'],
	},
);
