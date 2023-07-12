import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';

export default fp(
	async (app: FastifyInstance) => {
		await app.register(swagger, {
			swagger: {
				info: {
					title: app.config.SERVICE_NAME,
					description: 'Twig Challenge API documentation',
					version: app.config.SERVICE_VERSION,
				},
				host: `${app.config.HOST}:${app.config.PORT}`,
				schemes: ['http', 'https', 'ws', 'wss'],
				consumes: [
					'application/json',
					'multipart/form-data',
					'application/x-www-form-urlencoded',
				],
				produces: ['application/json'],
				security: [
					{
						Bearer: [
							"'Bearer'",
							"'bearer'",
							"'JWT'",
							"'jwt'",
							"'Token'",
							"'token'",
						],
					},
				],
				securityDefinitions: {
					Bearer: {
						type: 'apiKey',
						name: 'Authorization',
						in: 'header',
					},
				},
			},
			mode: 'dynamic',
		});

		// swagger-ui plugin will add swagger-ui support
		await app.register(swaggerUi, {
			routePrefix: '/documentation',
			uiConfig: {
				syntaxHighlight: {
					theme: 'monokai',
				},
				tryItOutEnabled: false,
			},
		});
	},
	{
		name: 'swagger',
		dependencies: ['config'],
	},
);
