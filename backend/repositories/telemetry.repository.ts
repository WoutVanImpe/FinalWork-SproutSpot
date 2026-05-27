import { db } from "../db/connection";
import { DLI_HOURS_PER_ENTRY } from "../config";
import { ActiveIssueRecord, PendingNotificationRecord, ProbeEntryRecord, StageThresholdsRecord, UserPlantRecord } from "../types/database";
import { TelemetryEntryDto, TelemetryPayloadDto } from "../types/dto";

export interface DailyLightSummary {
	userPlantId: number;
	userId: number;
	nickname: string | null;
	lightMin: number;
	requiredHours: number;
	cumulativeHours: number;
}

export interface DailyTemperatureSummary {
	userPlantId: number;
	userId: number;
	nickname: string | null;
	tempMin: number;
	dailyAvgTemp: number;
}

export interface LinkedPlantResult {
	userPlant: UserPlantRecord;
	thresholds: StageThresholdsRecord;
}

export class TelemetryRepository {
	/**
	 * @description Batch insert multiple telemetry entries for a single probe. Each entry's time_t (Unix epoch seconds) is converted to a created_at timestamp.
	 * @param {string} hardwareId - The probe's hardware identifier (MAC address).
	 * @param {TelemetryEntryDto[]} entries - Array of telemetry entries with already-mapped soil moisture.
	 * @returns {Promise<ProbeEntryRecord[]>} The created probe entry records.
	 */
	async createEntries(hardwareId: string, entries: TelemetryEntryDto[]): Promise<ProbeEntryRecord[]> {
		const rows = entries.map((e) => ({
			sonde_id: hardwareId,
			temp_c: e.temp_c,
			light_lux: e.light_lux,
			soil_moist_pct: e.soil_raw,
			battery_voltage: e.battery_voltage,
			wifi_rssi: e.wifi_rssi,
			created_at: new Date(e.time_t * 1000),
		}));

		return db("probe_entries").insert(rows).returning("*");
	}

	/**
	 * @description Create a new probe entry record with mapped telemetry data (soil moisture already converted to percentage).
	 * @param {TelemetryPayloadDto} payload - Telemetry data with hardware_id, temperature, light, mapped soil moisture, battery, and WiFi.
	 * @returns {Promise<ProbeEntryRecord>} The created probe entry record.
	 */
	async createEntry(payload: TelemetryPayloadDto): Promise<ProbeEntryRecord> {
		const [entry] = await db("probe_entries")
			.insert({
				sonde_id: payload.hardware_id,
				temp_c: payload.temp_c,
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

	async getRecentEntriesBySondeIdInRange(sondeId: string, hours: number): Promise<ProbeEntryRecord[]> {
		return db("probe_entries")
			.where("sonde_id", sondeId)
			.where("created_at", ">=", db.raw(`NOW() - INTERVAL '${hours} hours'`))
			.orderBy("created_at", "desc");
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

	async findActivePlantByProbe(hardwareId: string): Promise<LinkedPlantResult | undefined> {
		const row = await db("user_plants as up")
			.join("plant_stages as ps", function () {
				this.on("up.plant_id", "=", "ps.plant_id")
					.andOn("up.current_stage_order", "=", "ps.stage_order");
			})
			.where("up.sonde_id", hardwareId)
			.where("up.is_active", true)
			.first(
				"up.*",
				"ps.thresholds"
			);

		if (!row) return undefined;

		const thresholds: StageThresholdsRecord =
			typeof row.thresholds === "string"
				? JSON.parse(row.thresholds)
				: row.thresholds;

		const { thresholds: _t, ...userPlant } = row;

		return { userPlant: userPlant as UserPlantRecord, thresholds };
	}

	async getRecentEntriesBefore(hardwareId: string, beforeTimestamp: Date, limit: number): Promise<ProbeEntryRecord[]> {
		return db("probe_entries")
			.where("sonde_id", hardwareId)
			.where("created_at", "<", beforeTimestamp)
			.orderBy("created_at", "desc")
			.limit(limit);
	}

	async findOpenIssuesByUserPlant(userPlantId: number): Promise<ActiveIssueRecord[]> {
		return db("active_issues")
			.where("user_plant_id", userPlantId)
			.whereNull("resolved_at");
	}

	async createIssue(userPlantId: number, issueType: string): Promise<ActiveIssueRecord> {
		const [issue] = await db("active_issues")
			.insert({
				user_plant_id: userPlantId,
				issue_type: issueType,
				occurrence_count: 1,
				start_time: db.fn.now(),
				last_seen: db.fn.now(),
			})
			.returning("*");

		return issue;
	}

	async incrementIssueOccurrence(issueId: number): Promise<ActiveIssueRecord> {
		const [issue] = await db("active_issues")
			.where("id", issueId)
			.increment("occurrence_count", 1)
			.update({ last_seen: db.fn.now() })
			.returning("*");

		return issue;
	}

	async resolveIssue(issueId: number): Promise<ActiveIssueRecord | undefined> {
		const [issue] = await db("active_issues")
			.where("id", issueId)
			.update({ resolved_at: db.fn.now() })
			.returning("*");

		return issue;
	}

	async findUserNotificationWindow(userId: number): Promise<{ notification_window_start: string; notification_window_end: string } | undefined> {
		return db("users")
			.where("id", userId)
			.first("notification_window_start", "notification_window_end");
	}

	async createNotification(params: {
		userId: number;
		userPlantId: number;
		issueId: number;
		title: string;
		message: string;
		notificationType: "sensor_alert";
		state: "sent" | "snoozed";
		snoozedUntil?: Date | null;
	}): Promise<PendingNotificationRecord> {
		const [notification] = await db("pending_notifications")
			.insert({
				user_id: params.userId,
				user_plant_id: params.userPlantId,
				issue_id: params.issueId,
				title: params.title,
				message: params.message,
				notification_type: params.notificationType,
				notification_state: params.state,
				snoozed_until: params.snoozedUntil ?? null,
			})
			.returning("*");

		return notification;
	}

	async getDailyLightSummary(): Promise<DailyLightSummary[]> {
		const rows = await db("user_plants as up")
			.join("plant_stages as ps", function () {
				this.on("up.plant_id", "=", "ps.plant_id")
					.andOn("up.current_stage_order", "=", "ps.stage_order");
			})
			.leftJoin("probe_entries as pe", function () {
				this.on("pe.sonde_id", "=", "up.sonde_id")
					.andOn("pe.created_at", ">=", db.raw("CURRENT_DATE"))
					.andOn("pe.light_lux", ">=", db.raw("(ps.thresholds->>'light_min')::numeric"));
			})
			.where("up.is_active", true)
			.whereNotNull("up.sonde_id")
			.where("up.created_at", "<", db.raw("CURRENT_DATE"))
			.groupBy("up.id", "up.user_id", "up.nickname", "ps.thresholds")
			.select(
				"up.id",
				"up.user_id",
				"up.nickname",
				db.raw("(ps.thresholds->>'light_min')::numeric as light_min"),
				db.raw("COALESCE((ps.thresholds->>'required_daily_sun_hours')::numeric, 6) as required_hours"),
				db.raw("COUNT(pe.id) as entry_count"),
			);

		return rows.map((r: any) => ({
			userPlantId: r.id,
			userId: r.user_id,
			nickname: r.nickname,
			lightMin: Number(r.light_min),
			requiredHours: Number(r.required_hours),
			cumulativeHours: Number(r.entry_count ?? 0) * DLI_HOURS_PER_ENTRY,
		}));
	}

	async getDailyTemperatureSummary(): Promise<DailyTemperatureSummary[]> {
		const rows = await db("user_plants as up")
			.join("plant_stages as ps", function () {
				this.on("up.plant_id", "=", "ps.plant_id")
					.andOn("up.current_stage_order", "=", "ps.stage_order");
			})
			.leftJoin("probe_entries as pe", function () {
				this.on("pe.sonde_id", "=", "up.sonde_id")
					.andOn("pe.created_at", ">=", db.raw("CURRENT_DATE"));
			})
			.where("up.is_active", true)
			.whereNotNull("up.sonde_id")
			.where("up.created_at", "<", db.raw("CURRENT_DATE"))
			.groupBy("up.id", "up.user_id", "up.nickname", "ps.thresholds")
			.select(
				"up.id",
				"up.user_id",
				"up.nickname",
				db.raw("(ps.thresholds->>'temp_min')::numeric as temp_min"),
				db.raw("AVG(pe.temp_c) as daily_avg_temp"),
			);

		return rows.map((r: any) => ({
			userPlantId: r.id,
			userId: r.user_id,
			nickname: r.nickname,
			tempMin: Number(r.temp_min),
			dailyAvgTemp: Number(r.daily_avg_temp ?? 0),
		}));
	}

}
