const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:5001";

export default ({ config }) => ({
	...config,
	plugins: [...(config.plugins ?? []), "expo-secure-store"],
	extra: {
		...config.extra,
		apiBaseUrl: API_BASE_URL,
	},
});
