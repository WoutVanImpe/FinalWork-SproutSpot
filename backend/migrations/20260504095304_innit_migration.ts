import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
	return (
		knex.schema
			// 1. Users & Settings
			.createTable("users", (table) => {
				table.increments("id").primary();
				table.string("name").notNullable();
				table.string("profile_picture");
				table.string("email").unique().notNullable();
				table.string("password_hash").notNullable();
				table.string("push_token");
				table.boolean("push_enabled").defaultTo(true).notNullable();
				table.time("notification_window_start").defaultTo("08:00:00");
				table.time("notification_window_end").defaultTo("22:00:00");
				table.string("pairing_code").unique().notNullable();
				table.timestamp("created_at").defaultTo(knex.fn.now());
			})

			// 2. Plant-Encyclopedia
			.createTable("plants", (table) => {
				table.increments("id").primary();
				table.string("name").notNullable();
				table.string("light").notNullable();
				table.string("water").notNullable();
				table.string("difficulty").notNullable();
				table.string("temperature").notNullable();
				table.enum("planting_type", ["indoor", "outdoor", "both"]).notNullable();
				table.string("image").notNullable();
				table.enum("sunlight", ["full", "partial", "shade"]).nullable();
				table.enum("care_level", ["daily", "weekly", "minimal"]).nullable();
				table.float("temperature_min").nullable();
				table.float("temperature_max").nullable();
				table.integer("total_days").nullable();
				table.float("sowing_depth").notNullable();
				table.float("sowing_distance").notNullable();
				table.float("pot_min_depth").notNullable();
				table.jsonb("sowing_period").notNullable();
				table.string("germination_time").notNullable();
				table.string("repotting_after").notNullable();
				table.string("total_growth_time").notNullable();
			})

			// 3. Probe
			.createTable("probes", (table) => {
				table.increments("id").primary();
				table.string("hardware_id").unique().notNullable();
				table.string("name").notNullable();
				table.integer("user_id").unsigned().references("id").inTable("users").onDelete("CASCADE");
				table.enum("state", ["paired", "available", "offline"]).notNullable();
				table.string("pairing_code").unique().nullable();
				table.float("battery_voltage").notNullable();
				table.float("wifi_rssi").notNullable();
				table.timestamp("last_seen").defaultTo(knex.fn.now());
			})

			// 4. Garden layout
			.createTable("user_gardens", (table) => {
				table.increments("id").primary();
				table.integer("user_id").unsigned().references("id").inTable("users").onDelete("CASCADE");
				table.integer("width").defaultTo(3);
				table.integer("height").defaultTo(3);
				table.timestamp("created_at").defaultTo(knex.fn.now());
			})

			// 5. Growth stadia & Thresholds
			.createTable("plant_stages", (table) => {
				table.increments("id").primary();
				table.integer("plant_id").unsigned().references("id").inTable("plants").onDelete("CASCADE");
				table.string("stage_name").notNullable();
				table.integer("stage_order").notNullable();
				table.integer("duration_days").notNullable();
				table.jsonb("thresholds").notNullable();
				table.text("validation_description").notNullable();
				table.jsonb("requirements").nullable();
				table.jsonb("instructions").nullable();
			})

			// 6. User plants
			.createTable("user_plants", (table) => {
				table.increments("id").primary();
				table.integer("user_id").unsigned().references("id").inTable("users");
				table.integer("plant_id").unsigned().references("id").inTable("plants");
				table.string("nickname").nullable();
				table.string("sonde_id").references("hardware_id").inTable("probes");
				table.timestamp("date_sown").defaultTo(knex.fn.now());
				table.integer("current_stage_order").defaultTo(1);
				table.timestamp("last_stage_update").defaultTo(knex.fn.now());
				table.boolean("is_active").defaultTo(true);
				table.integer("garden_id").unsigned().references("id").inTable("user_gardens");
				table.integer("x_pos");
				table.integer("y_pos");
				table.timestamp("created_at").defaultTo(knex.fn.now());
				table.enum("deactivation_reason", ["harvested", "died", "removed", "reused"]).nullable().defaultTo(null);
				table.timestamp("deactivated_at").nullable().defaultTo(null);
			})

			// 7. Probe entry
			.createTable("probe_entries", (table) => {
				table.increments("id").primary();
				table.string("sonde_id").references("hardware_id").inTable("probes");
				table.float("temp_c");
				table.float("light_lux");
				table.float("soil_moist_pct");
				table.float("battery_voltage").notNullable();
				table.float("wifi_rssi").notNullable();
				table.timestamp("created_at").defaultTo(knex.fn.now());
			})

			// 8. Active plant issues
			.createTable("active_issues", (table) => {
				table.increments("id").primary();
				table.integer("user_plant_id").unsigned().references("id").inTable("user_plants");
				table.string("issue_type").notNullable();
				table.integer("occurrence_count").defaultTo(1);
				table.timestamp("resolved_at").nullable().defaultTo(null);
				table.boolean("user_acknowledged").defaultTo(false);
				table.timestamp("start_time").defaultTo(knex.fn.now());
				table.timestamp("last_seen").defaultTo(knex.fn.now());
			})

			// 9. Pending Notifications
			.createTable("pending_notifications", (table) => {
				table.increments("id").primary();
				table.integer("user_id").unsigned().references("id").inTable("users");
				table.integer("user_plant_id").unsigned().references("id").inTable("user_plants");
				table.integer("issue_id").unsigned().references("id").inTable("active_issues").nullable();
				table.string("title").notNullable();
				table.text("message").notNullable();
				table.enum("notification_type", ["sensor_alert", "stage_validation", "system_status"]);
				table.enum("notification_state", ["sent", "acknowledged", "snoozed"]);
				table.timestamp("snoozed_until").nullable();
				table.timestamp("created_at").defaultTo(knex.fn.now());
			})
	);
}

export async function down(knex: Knex): Promise<void> {
	return knex.schema
		.dropTableIfExists("pending_notifications")
		.dropTableIfExists("active_issues")
		.dropTableIfExists("probe_entries")
		.dropTableIfExists("user_plants")
		.dropTableIfExists("plant_stages")
		.dropTableIfExists("probes")
		.dropTableIfExists("plants")
		.dropTableIfExists("user_gardens")
		.dropTableIfExists("users");
}
