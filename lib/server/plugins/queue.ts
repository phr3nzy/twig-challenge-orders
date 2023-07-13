import amqp from 'amqplib';
import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';

declare module 'fastify' {
	interface FastifyInstance {
		queue: {
			connection: amqp.Connection;
			channel: amqp.Channel;
		};
	}
}

export default fp(async (app: FastifyInstance) => {
	const connection = await amqp.connect(app.config.QUEUE_URL);

	const channel = await connection.createChannel();

	channel.on('error', error => {
		app.log.error(
			error,
			'An error occurred while attempting to create a channel.',
		);
	});

	app.log.info('Queue channel created.');

	connection.on('error', error => {
		app.log.error(
			error,
			'An error occurred while attempting to connect to the queue.',
		);
	});

	connection.on('connection', () => {
		app.log.info('Connected to the queue.');
	});

	await channel.assertQueue(app.config.EMAILS_QUEUE_NAME, {
		durable: false,
	});

	await channel.assertQueue(app.config.PAYMENTS_QUEUE_NAME, {
		durable: false,
	});

	await channel.assertQueue(app.config.ORDERS_QUEUE_NAME, {
		durable: false,
	});

	app.decorate('queue', { connection, channel });

	app.addHook('onClose', async () => {
		app.log.debug('Queue shutting down...');
		await channel.close();
		await connection.close();
	});
});
