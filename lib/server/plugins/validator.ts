import Ajv from 'ajv';
import applyErrors from 'ajv-errors';
import applyFormats from 'ajv-formats';
import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import s from 'fluent-json-schema';
import * as magicRegexp from 'magic-regexp';

import { AJV_CONFIG } from '../config/ajv.js';

declare module 'fastify' {
	interface FastifyInstance {
		fluentSchema: typeof s;
		ajv: Ajv;
		magicRegexp: typeof magicRegexp;
	}
}

export default fp(
	async (app: FastifyInstance) => {
		const ajv = new Ajv(AJV_CONFIG);
		applyFormats(ajv);
		applyErrors(ajv);

		// Add ajv to the server instance
		app.decorate('ajv', ajv);

		// Add fluent-json-schema to the server instance
		app.decorate('fluentSchema', s);

		// Add magic-regexp to the server instance
		app.decorate('magicRegexp', magicRegexp);

		// Set the validator compiler to use ajv
		app.setValidatorCompiler(({ schema }) => app.ajv.compile(schema));
	},
	{
		name: 'validator',
	},
);
