import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
	await knex.schema.alterTable("pending_notifications", (table) => {
		table.timestamp("last_reminded_at").nullable();
	});
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.alterTable("pending_notifications", (table) => {
		table.dropColumn("last_reminded_at");
	});
}
