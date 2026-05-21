import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
	await knex.schema.alterTable("users", (table) => {
		table.boolean("push_enabled").defaultTo(true).notNullable();
	});
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.alterTable("users", (table) => {
		table.dropColumn("push_enabled");
	});
}
