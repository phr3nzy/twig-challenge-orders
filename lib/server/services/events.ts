import type { FastifyInstance } from 'fastify';

export default async function events(app: FastifyInstance) {
	await app.queue.channel.consume(app.config.ORDERS_QUEUE_NAME, async msg => {
		if (msg) {
			const { message, data } = JSON.parse(msg.content.toString()) as {
				message: string;
				data: {
					paymentId: string;
					status: 'created' | 'completed';
				};
			};

			const { paymentId, status } = data;

			const order = await app.db.order.findUnique({
				where: { paymentId },
			});

			if (order && status === 'completed' && message === 'payment-completed') {
				await app.db.order.update({
					where: { id: order.id },
					data: {
						status: 'completed',
					},
				});

				app.log.info(`Order ${order.id} completed.`);
			} else {
				app.log.error('Order not found.');
			}

			app.queue.channel.ack(msg);
		}
	});
}
