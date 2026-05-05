import knex from "knex";
import knexConfig from "../knexfile";

const environment = process.env.NODE_ENV || "development";
const config = knexConfig[environment as keyof typeof knexConfig];

if (!config) {
	throw new Error(`No knex configuration found for environment: ${environment}`);
}

export const db = knex(config);
