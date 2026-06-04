const ENV_API_BASE_URL = process.env.API_BASE_URL;

export default ({ config }) => ({
	...config,
	plugins: [...(config.plugins ?? []), "expo-secure-store"],
	extra: {
		...config.extra,
		apiBaseUrl: ENV_API_BASE_URL || config.extra?.apiBaseUrl,
	},
});
