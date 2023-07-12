export default {
	// Supports all esbuild.build options
	esbuild: {
		minify: false,
		target: 'es2022',
		format: 'esm',
	},
	// Prebuild hook
	prebuild: async () => {
		console.log('prebuild');
		const rimraf = (await import('rimraf')).default;
		rimraf.sync('./dist'); // clean up dist folder
	},
	// Postbuild hook
	postbuild: async () => {
		console.log('postbuild');
		const cpy = (await import('cpy')).default;
		await cpy(
			[
				'lib/**/*.graphql', // Copy all .graphql files
				'!lib/**/*.{tsx,ts,js,jsx}', // Ignore already built files
			],
			'dist',
		);
	},
};
