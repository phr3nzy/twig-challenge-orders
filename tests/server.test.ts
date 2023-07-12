import 'make-promises-safe';
import type { FastifyInstance } from 'fastify';
import { bootstrap } from '../lib/server';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

describe('server', () => {
	let server: FastifyInstance;

	beforeAll(async () => {
		server = await bootstrap();
	});

	afterAll(async () => {
		await server.close();
	});

	it('should have all plugins registered and ready to use', async () => {
		expect(server.hasDecorator('config')).toBe(true);
		expect(server.hasDecorator('db')).toBe(true);
	});
});
