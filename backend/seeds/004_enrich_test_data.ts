import type { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
	const userId = 1;
	const gardenId = 1;

	await knex("pending_notifications").del();
	await knex("active_issues").del();
	await knex("probe_entries").del();
	await knex("user_plants").del();
	await knex("probes").del();
	await knex("user_gardens").del();

	await knex.raw("ALTER SEQUENCE user_gardens_id_seq RESTART WITH 1");
	await knex.raw("ALTER SEQUENCE user_plants_id_seq RESTART WITH 1");
	await knex.raw("ALTER SEQUENCE probes_id_seq RESTART WITH 1");
	await knex.raw("ALTER SEQUENCE probe_entries_id_seq RESTART WITH 1");
	await knex.raw("ALTER SEQUENCE active_issues_id_seq RESTART WITH 1");
	await knex.raw("ALTER SEQUENCE pending_notifications_id_seq RESTART WITH 1");

	await knex("user_gardens").insert({ id: gardenId, user_id: userId, width: 5, height: 6 });

	const plants = [
		{ id: 1, plant_id: 18, nickname: "Toby", x_pos: 0, y_pos: 0 },
		{ id: 2, plant_id: 5, nickname: "Bas de Basilicum", x_pos: 2, y_pos: 1 },
		{ id: 3, plant_id: 1, nickname: "Munt", x_pos: 4, y_pos: 2 },
		{ id: 4, plant_id: 22, nickname: "Rocket", x_pos: 1, y_pos: 3 },
		{ id: 5, plant_id: 25, nickname: "Capsicum", x_pos: 3, y_pos: 4 },
	];

	for (const p of plants) {
		await knex("user_plants").insert({
			id: p.id,
			user_id: userId,
			plant_id: p.plant_id,
			nickname: p.nickname,
			garden_id: gardenId,
			x_pos: p.x_pos,
			y_pos: p.y_pos,
			current_stage_order: 1,
		});
	}

	const now = Date.now();

	await knex("probes").insert({
		id: 1,
		hardware_id: "AA:BB:CC:DD:EE:01",
		name: "Sonde 1",
		user_id: userId,
		state: "paired",
		battery_voltage: 3.8,
		wifi_rssi: -65,
	});

	await knex("user_plants").where({ user_id: userId, plant_id: 18 }).update({ sonde_id: "AA:BB:CC:DD:EE:01" });

	const entries = [];
	for (let i = 48; i >= 0; i--) {
		const t = now - i * 3600 * 1000;
		entries.push({
			sonde_id: "AA:BB:CC:DD:EE:01",
			temp_c: 20 + Math.sin(i * 0.3) * 3,
			humidity_pct: 55 + Math.sin(i * 0.2) * 10,
			light_lux: Math.max(0, 30000 + Math.sin(i * 0.5) * 15000),
			soil_moist_pct: 60 + Math.sin(i * 0.4) * 15,
			battery_voltage: 3.8,
			wifi_rssi: -65,
			created_at: new Date(t),
		});
	}
	await knex("probe_entries").insert(entries);

	await knex("active_issues").insert({
		user_plant_id: 1,
		issue_type: "low_water",
		occurrence_count: 3,
		start_time: new Date(now - 2 * 3600 * 1000),
		last_seen: new Date(),
	});

	await knex("pending_notifications").insert([
		{
			user_id: userId,
			user_plant_id: 1,
			issue_id: 1,
			title: "Toby heeft water nodig",
			message: "De grond rond je tomatenplant is te droog. Geef wat water.",
			notification_type: "sensor_alert",
			notification_state: "sent",
		},
		{
			user_id: userId,
			user_plant_id: 1,
			title: "Toby is ontkiemd!",
			message: "Je tomatenplant is ontkiemd en heeft nu echte blaadjes. Tijd om meer zon te geven!",
			notification_type: "stage_validation",
			notification_state: "sent",
		},
	]);

	await knex.raw("SELECT setval('user_plants_id_seq', (SELECT COALESCE(MAX(id),0) FROM user_plants))");
	await knex.raw("SELECT setval('probes_id_seq', (SELECT COALESCE(MAX(id),0) FROM probes))");
	await knex.raw("SELECT setval('probe_entries_id_seq', (SELECT COALESCE(MAX(id),0) FROM probe_entries))");
	await knex.raw("SELECT setval('active_issues_id_seq', (SELECT COALESCE(MAX(id),0) FROM active_issues))");
	await knex.raw("SELECT setval('pending_notifications_id_seq', (SELECT COALESCE(MAX(id),0) FROM pending_notifications))");
	await knex.raw("SELECT setval('user_gardens_id_seq', (SELECT COALESCE(MAX(id),0) FROM user_gardens))");
}
