import type { Knex } from "knex";
import bcrypt from "bcrypt";

export async function seed(knex: Knex): Promise<void> {
	await knex("users").del();

	const hash = await bcrypt.hash("test1234", 10);

	await knex("users").insert({
		name: "Test User",
		email: "test@sproutspot.app",
		password_hash: hash,
		pairing_code: "TE123456",
		notification_window_start: "08:00:00",
		notification_window_end: "22:00:00",
	});
}
