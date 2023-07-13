import type { OrderType } from '@prisma/client';
import type { FastifyInstance } from 'fastify';

interface ICreateOrderBody {
	email: string;
	amount: number;
	type: OrderType;
}

interface IFetchOrderQuery {
	orderId: string;
}

export default async function orderRoutes(app: FastifyInstance) {
	app.route<{ Body: ICreateOrderBody }>({
		method: 'POST',
		url: '/',
		schema: {
			operationId: 'createOrder',
			description: 'This route is used to create a new order.',
			summary: 'Create Order',
			produces: ['application/json'],
			body: app.fluentSchema
				.object()
				.additionalProperties(false)
				.description('The request body of a successful request')
				.prop('email', app.fluentSchema.string().required().format('email'))
				.prop('amount', app.fluentSchema.number().required().minimum(1))
				.prop(
					'type',
					app.fluentSchema
						.string()
						.required()
						.enum(['jewelry', 'shoes', 'grocery']),
				),
			response: {
				201: app.fluentSchema
					.object()
					.additionalProperties(false)
					.description('The response of a successful request')
					.prop('success', app.fluentSchema.boolean())
					.prop('message', app.fluentSchema.string())
					.prop('orderId', app.fluentSchema.string()),
			},
		},
		handler: async (request, reply) => {
			try {
				const { email, amount, type } = request.body;

				const createdOrder = await app.db.order.create({
					data: {
						email,
						amount,
						type,
						status: 'created',
					},
				});

				app.queue.channel.sendToQueue(
					app.config.EMAILS_QUEUE_NAME,
					Buffer.from(
						JSON.stringify({
							message: 'order-created',
							data: {
								orderId: createdOrder.id,
								email,
								amount,
								type,
								status: 'created',
							},
						}),
						'utf-8',
					),
				);

				const { data, status: paymentInitiationHttpStatus } =
					await app.httpClient.post<{
						success: boolean;
						message: string;
						paymentId: string;
						status: 'created' | 'completed';
					}>(`${app.config.PAYMENTS_SERVICE_URL}/payments/initiate`, {
						email,
						amount,
						type,
					});

				const { paymentId, status, success, message } = data;

				const paymentFailedToInitiate =
					!success ||
					paymentInitiationHttpStatus !== 201 ||
					status !== 'created';

				if (paymentFailedToInitiate) {
					reply.badRequest(`Payment failed to initiate. ${message}`);
					return;
				}

				await app.db.order.update({
					where: {
						id: createdOrder.id,
					},
					data: {
						paymentId,
						status: 'paymentInitiated',
					},
				});

				// eslint-disable-next-line @typescript-eslint/no-floating-promises
				reply.status(201);
				return {
					success: true,
					message: `Order created.`,
					orderId: createdOrder.id,
				};
			} catch (error) {
				app.log.error(error, 'An error occurred while creating an order.');
				reply.internalServerError();
				return;
			}
		},
	});

	app.route<{ Querystring: IFetchOrderQuery }>({
		method: 'GET',
		url: '/',
		schema: {
			operationId: 'fetchOrder',
			description: 'This route is used to fetch an order.',
			summary: 'Fetch Order',
			produces: ['application/json'],
			querystring: app.fluentSchema
				.object()
				.additionalProperties(false)
				.prop('orderId', app.fluentSchema.string().required().format('uuid')),
			response: {
				200: app.fluentSchema
					.object()
					.additionalProperties(false)
					.description('The response of a successful request')
					.prop('success', app.fluentSchema.boolean())
					.prop('message', app.fluentSchema.string())
					.prop(
						'order',
						app.fluentSchema
							.object()
							.prop('id', app.fluentSchema.string())
							.prop('email', app.fluentSchema.string().format('email'))
							.prop('amount', app.fluentSchema.number())
							.prop(
								'type',
								app.fluentSchema.string().enum(['jewelry', 'shoes', 'grocery']),
							)
							.prop(
								'status',
								app.fluentSchema
									.string()
									.enum(['created', 'paymentInitiated', 'completed']),
							),
					),
			},
		},
		handler: async (request, reply) => {
			try {
				const { orderId } = request.query;

				const order = await app.db.order.findUnique({
					where: {
						id: orderId,
					},
				});

				if (!order) {
					reply.notFound();
					return;
				}

				// eslint-disable-next-line @typescript-eslint/no-floating-promises
				reply.status(200);
				return {
					success: true,
					message: `Order fetched for ${orderId}`,
					order,
				};
			} catch (error) {
				app.log.error(error, 'An error occurred while fetching an order.');
				reply.internalServerError();
				return;
			}
		},
	});
}
