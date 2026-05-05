import { db } from "../db/connection";
import { ProbeEntryRecord } from "../types/database";
import { TelemetryPayloadDto } from "../types/dto";

export class TelemetryRepository {
	async createEntry(payload: TelemetryPayloadDto): Promise<ProbeEntryRecord> {
		const [entry] = await db("probe_entries")
			.insert({
				sonde_id: payload.hardware_id,
				temp_c: payload.temp_c,
				humidity_pct: payload.humidity_pct,
				light_lux: payload.light_lux,
				soil_moist_pct: payload.soil_raw,
				battery_voltage: payload.battery_voltage,
				wifi_rssi: payload.wifi_rssi,
			})
			.returning("*");

		return entry;
	}

	async getLatestEntryBySondeId(sondeId: string): Promise<ProbeEntryRecord | undefined> {
		const entry = await db("probe_entries")
			.where("sonde_id", sondeId)
			.orderBy("created_at", "desc")
			.first();

		return entry;
	}

	async getRecentEntriesBySondeId(sondeId: string, limit: number): Promise<ProbeEntryRecord[]> {
		const entries = await db("probe_entries")
			.where("sonde_id", sondeId)
			.orderBy("created_at", "desc")
			.limit(limit);

		return entries;
	}

	async getActiveUserPlantBySondeId(sondeId: string) {
		const userPlant = await db("user_plants as up")
			.join("users as u", "up.user_id", "u.id")
			.join("plants as p", "up.plant_id", "p.id")
			.leftJoin("plant_stages as ps", function () {
				this.on("ps.plant_id", "up.plant_id").andOn("ps.stage_order", "up.current_stage_order");
			})
			.where("up.sonde_id", sondeId)
			.andWhere("up.is_active", true)
			.select(
				"up.id as user_plant_id",
				"up.user_id",
				"up.plant_id",
				"up.current_stage_order",
				"p.name as plant_name",
				"ps.thresholds",
				"u.notification_window_start",
				"u.notification_window_end"
			)
			.first();

		return userPlant;
	}

	async updateProbeHealth(hardwareId: string, batteryVoltage: number, wifiRssi: number): Promise<void> {
		await db("probes")
			.where("hardware_id", hardwareId)
			.update({
				battery_voltage: batteryVoltage,
				wifi_rssi: wifiRssi,
				last_seen: db.fn.now(),
			});
	}
}
