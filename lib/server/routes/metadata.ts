import type { FastifyInstance } from 'fastify';

export default async function metadataRoute(app: FastifyInstance) {
	app.route({
		method: 'GET',
		url: '/',
		schema: {
			operationId: 'getMetadata',
			description: 'This route is used to display metadata on the API.',
			summary: 'Get Metadata',
			produces: ['application/json'],
			response: {
				200: app.fluentSchema
					.object()
					.additionalProperties(false)
					.description('The response of a successful request')
					.prop('description', app.fluentSchema.string())
					.prop(
						'version',
						app.fluentSchema
							.string()
							.pattern(
								/^([\d]{1}).([\d]{1,8}).([\d]{1,8})([-_](alpha|beta|rc))?$/,
							),
					)
					.prop('status', app.fluentSchema.string().enum(['live', 'dev'])),
			},
		},
		handler: (_, reply) => {
			// eslint-disable-next-line @typescript-eslint/no-floating-promises
			reply.status(200);
			return {
				description: app.config.SERVICE_NAME,
				version: app.config.SERVICE_VERSION,
				status: app.config.NODE_ENV === 'production' ? 'live' : 'dev',
			};
		},
	});
}
