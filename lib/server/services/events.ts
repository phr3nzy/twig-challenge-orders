import type { FastifyInstance } from 'fastify';

type OrdersQueuePayload =
	| {
			message: 'payment-completed';
			data: {
				paymentId: string;
				status: 'created' | 'completed';
			};
	  }
	| {
			message: 'orders-email-sent';
			data: {
				orderId: string;
			};
	  }
	| {
			message: 'payments-email-sent';
			data: {
				email: string;
				paymentId: string;
			};
	  };

export default async function events(app: FastifyInstance) {
	await app.queue.channel.consume(app.config.ORDERS_QUEUE_NAME, async msg => {
		if (msg) {
			const { message, data } = JSON.parse(
				msg.content.toString(),
			) as OrdersQueuePayload;

			switch (message) {
				case 'payment-completed': {
					const { paymentId } = data;

					const order = await app.db.order.findFirst({
						where: { paymentId },
					});

					if (order) {
						await app.db.order.update({
							where: { id: order.id },
							data: {
								status: 'completed',
							},
						});
					}
					break;
				}
				case 'orders-email-sent': {
					app.log.info('Updating order email sent state.');
					const { orderId } = data;

					const order = await app.db.order.findFirst({
						where: { id: orderId },
					});

					if (order) {
						await app.db.order.update({
							where: { id: orderId },
							data: {
								orderEmailSent: true,
							},
						});
					}

					app.log.info('Order orderEmailSent state updated.');

					break;
				}
				case 'payments-email-sent': {
					const { paymentId } = data;

					const order = await app.db.order.findFirst({
						where: { paymentId },
					});

					if (order) {
						await app.db.order.update({
							where: { id: order.id },
							data: {
								paymentEmailSent: true,
							},
						});
					}

					app.log.info('Order paymentEmailSent state updated.');

					break;
				}
			}

			app.queue.channel.ack(msg);
		}
	});
}
