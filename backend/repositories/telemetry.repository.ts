import { db } from "../db/connection";
import { ProbeEntryRecord } from "../types/database";
import { TelemetryPayloadDto } from "../types/dto";

export class TelemetryRepository {
	/**
	 * @description Create a new probe entry record with mapped telemetry data (soil moisture already converted to percentage).
	 * @param {TelemetryPayloadDto} payload - Telemetry data with hardware_id, temperature, humidity, light, mapped soil moisture, battery, and WiFi.
	 * @returns {Promise<ProbeEntryRecord>} The created probe entry record.
	 */
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

	/**
	 * @description Update a probe's battery voltage, WiFi RSSI, and last_seen timestamp. Called during telemetry upload to keep hardware health current.
	 * @param {string} hardwareId - The probe's hardware identifier.
	 * @param {number} batteryVoltage - Current battery voltage reading.
	 * @param {number} wifiRssi - Current WiFi signal strength in dBm.
	 * @returns {Promise<void>}
	 */
	async updateProbeHealth(hardwareId: string, batteryVoltage: number, wifiRssi: number): Promise<void> {
		await db("probes")
			.where("hardware_id", hardwareId)
			.update({
				battery_voltage: batteryVoltage,
				wifi_rssi: wifiRssi,
				last_seen: db.fn.now(),
			});
	}

	/**
	 * @description Retrieve recent telemetry entries for a specific probe, ordered newest first.
	 * @param {string} sondeId - The probe's hardware identifier.
	 * @param {number} limit - Maximum number of entries to return.
	 * @returns {Promise<ProbeEntryRecord[]>} List of recent probe entries.
	 */
	async getRecentEntriesBySondeId(sondeId: string, limit: number): Promise<ProbeEntryRecord[]> {
		return db("probe_entries")
			.where("sonde_id", sondeId)
			.orderBy("created_at", "desc")
			.limit(limit);
	}

	/**
	 * @description Retrieve recent telemetry entries for all probes linked to a specific user plant, ordered newest first.
	 * @param {number} userPlantId - The user plant's database ID.
	 * @param {number} limit - Maximum number of entries to return.
	 * @returns {Promise<ProbeEntryRecord[]>} List of recent probe entries from the linked probe.
	 */
	async getRecentEntriesByUserPlantId(userPlantId: number, limit: number): Promise<ProbeEntryRecord[]> {
		return db("probe_entries as pe")
			.join("user_plants as up", "pe.sonde_id", "up.sonde_id")
			.where("up.id", userPlantId)
			.orderBy("pe.created_at", "desc")
			.limit(limit)
			.select("pe.*");
	}
}
