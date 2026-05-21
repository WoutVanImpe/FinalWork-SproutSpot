import type { Knex } from "knex";
import bcrypt from "bcrypt";

export async function seed(knex: Knex): Promise<void> {
	await knex("pending_notifications").del();
	await knex("active_issues").del();
	await knex("probe_entries").del();
	await knex("user_plants").del();
	await knex("probes").del();
	await knex("users").del();

	const hash = await bcrypt.hash("test1234", 10);

	await knex("users").insert({
		id: 1,
		name: "Test User",
		email: "test@sproutspot.app",
		password_hash: hash,
		pairing_code: "TE123456",
		notification_window_start: "00:00:00",
		notification_window_end: "23:00:00",
	});
}
