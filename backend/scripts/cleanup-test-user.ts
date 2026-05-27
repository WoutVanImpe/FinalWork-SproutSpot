import { db } from "../db/connection";

async function cleanup() {
	const email = "test@sproutspot.app";

	const user = await db("users").where({ email }).first();
	if (!user) {
		console.log(`No user found with email "${email}". Nothing to clean up.`);
		await db.destroy();
		return;
	}

	console.log(`Found test user: ${user.name} (${user.email}), id=${user.id}`);

	await db("pending_notifications").where({ user_id: user.id }).del();
	await db("active_issues").whereIn("user_plant_id", db("user_plants").select("id").where({ user_id: user.id })).del();
	await db("probe_entries").whereIn("sonde_id", db("probes").select("hardware_id").where({ user_id: user.id })).del();
	await db("user_plants").where({ user_id: user.id }).del();
	await db("probes").where({ user_id: user.id }).del();
	await db("user_gardens").where({ user_id: user.id }).del();
	await db("users").where({ id: user.id }).del();

	console.log("Test user and all related data deleted successfully.");

	await db.destroy();
}

cleanup().catch((err) => {
	console.error("Cleanup failed:", err);
	process.exit(1);
});
