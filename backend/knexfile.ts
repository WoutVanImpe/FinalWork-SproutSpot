import path from "node:path";

const knexConfig = {
	development: {
		client: "pg",
		connection: {
			host: process.env.DATABASE_HOST || "localhost",
			port: Number.parseInt(process.env.DATABASE_PORT || "5432"),
			user: process.env.DATABASE_USER || "postgres",
			password: process.env.DATABASE_PASSWORD || "postgres",
			database: process.env.DATABASE_DB || "sproutspot",
			ssl: { rejectUnauthorized: false },
			family: 4,
		},
		migrations: {
			directory: path.join(__dirname, "migrations"),
			extension: "ts",
		},
		seeds: {
			directory: path.join(__dirname, "seeds"),
		},
	},
};

export default knexConfig;
