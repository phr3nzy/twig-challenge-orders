import type { Prisma } from '@prisma/client';
import { PrismaClient } from '@prisma/client';
import { logger } from '../lib/server/config/logger.js';

const { NODE_ENV = 'development' } = process.env;

const prisma = new PrismaClient({
	errorFormat: NODE_ENV === 'production' ? 'minimal' : 'pretty',
	log: [
		{
			emit: 'event',
			level: 'query',
		},
		{
			emit: 'event',
			level: 'error',
		},
		{
			emit: 'event',
			level: 'info',
		},
		{
			emit: 'event',
			level: 'warn',
		},
	],
});

prisma.$on('query', event => {
	logger.debug(event);
});

prisma.$on('error', event => {
	logger.error(event);
});

prisma.$on('info', event => {
	logger.info(event);
});

prisma.$on('warn', event => {
	logger.warn(event);
});

async function main() {
	logger.info('Start seeding...');
	/**
	 * Seed your database here
	 */
	logger.info('Seeding finished.');
}

try {
	await main();
	await prisma.$disconnect();
} catch (error) {
	await prisma.$disconnect();
	console.error(error);
	process.exit(1);
}
