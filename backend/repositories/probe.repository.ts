import { db } from "../db/connection";
import { ProbeRecord, UserPlantRecord } from "../types/database";

export interface StaleProbeResult {
	probe: ProbeRecord;
	userPlant: UserPlantRecord;
}

export interface ProbeWithPlant extends ProbeRecord {
	linked_plant: { nickname: string; name: string } | null;
}

export class ProbeRepository {
	/**
	 * @description Create a new probe record with hardware ID and user association. Name defaults to "Unnamed Probe" until the user sets it.
	 * @param {string} hardwareId - The probe's unique hardware identifier (MAC address).
	 * @param {number} userId - The user to assign this probe to (resolved via pairing code).
	 * @returns {Promise<ProbeRecord>} The created probe record.
	 */
	async create(hardwareId: string, userId: number, pairingCode?: string): Promise<ProbeRecord> {
		const [probe] = await db("probes")
			.insert({
				hardware_id: hardwareId,
				name: "Unnamed Probe",
				user_id: userId,
				state: "available",
				pairing_code: pairingCode ?? null,
				battery_voltage: 0,
				wifi_rssi: 0,
				is_charging: false,
			})
			.returning("*");

		return probe;
	}

	/**
	 * @description Find a probe by its hardware ID (MAC address).
	 * @param {string} hardwareId - The probe's unique hardware identifier.
	 * @returns {Promise<ProbeRecord | undefined>} The probe record or undefined if not found.
	 */
	async findByHardwareId(hardwareId: string): Promise<ProbeRecord | undefined> {
		return db("probes").where("hardware_id", hardwareId).first();
	}

	async findByPairingCode(pairingCode: string): Promise<ProbeRecord | undefined> {
		return db("probes").where("pairing_code", pairingCode).first();
	}

	async findStaleProbes(thresholdMinutes: number): Promise<StaleProbeResult[]> {
		const threshold = db.raw(`NOW() - INTERVAL '1 minute' * ?`, [thresholdMinutes]);
		const rows = await db("probes as p")
			.join("user_plants as up", "up.sonde_id", "p.hardware_id")
			.where("p.state", "paired")
			.where("p.last_seen", "<", threshold)
			.where("up.is_active", true)
			.select(
				"p.*",
				"up.id as up_id",
				"up.user_id as up_user_id",
				"up.plant_id as up_plant_id",
				"up.garden_id as up_garden_id",
				"up.nickname as up_nickname",
				"up.sonde_id as up_sonde_id",
				"up.current_stage_order as up_stage_order",
				"up.is_active as up_is_active",
				"up.x_pos as up_x_pos",
				"up.y_pos as up_y_pos",
				"up.date_sown as up_date_sown",
				"up.last_stage_update as up_last_stage_update",
				"up.created_at as up_created_at",
				"up.deactivation_reason as up_deactivation_reason",
				"up.deactivated_at as up_deactivated_at",
			);

		return rows.map((row: any) => {
			const {
				up_id, up_user_id, up_plant_id, up_garden_id,
				up_nickname, up_sonde_id, up_stage_order, up_is_active,
				up_x_pos, up_y_pos, up_date_sown, up_last_stage_update,
				up_created_at, up_deactivation_reason, up_deactivated_at,
				...probeFields
			} = row;
			return {
				probe: probeFields as ProbeRecord,
				userPlant: {
					id: up_id,
					user_id: up_user_id,
					plant_id: up_plant_id,
					garden_id: up_garden_id,
					nickname: up_nickname,
					sonde_id: up_sonde_id,
					current_stage_order: up_stage_order,
					is_active: up_is_active,
					x_pos: up_x_pos,
					y_pos: up_y_pos,
					date_sown: up_date_sown,
					last_stage_update: up_last_stage_update,
					created_at: up_created_at,
					deactivation_reason: up_deactivation_reason,
					deactivated_at: up_deactivated_at,
				} as UserPlantRecord,
			};
		});
	}

	/**
	 * @description Find a probe by its database ID.
	 * @param {number} id - The probe's database ID.
	 * @returns {Promise<ProbeRecord | undefined>} The probe record or undefined if not found.
	 */
	async findById(id: number): Promise<ProbeRecord | undefined> {
		return db("probes").where("id", id).first();
	}

	/**
	 * @description Retrieve all probes belonging to a user, ordered by last_seen descending. Includes linked plant info.
	 * @param {number} userId - The user's database ID.
	 * @returns {Promise<ProbeWithPlant[]>} List of probe records with linked plant info.
	 */
	async findByUserId(userId: number): Promise<ProbeWithPlant[]> {
		const rows = await db("probes as p")
			.leftJoin("user_plants as up", "p.hardware_id", "up.sonde_id")
			.leftJoin("plants as pl", "up.plant_id", "pl.id")
			.where("p.user_id", userId)
			.select(
				"p.*",
				"up.nickname as plant_nickname",
				"pl.name as plant_name",
			)
			.orderBy("p.last_seen", "desc");

		return rows.map((row: any) => ({
			...row,
			linked_plant: row.plant_nickname
				? { nickname: row.plant_nickname, name: row.plant_name }
				: null,
			plant_nickname: undefined,
			plant_name: undefined,
		}));
	}

	/**
	 * @description Assign a probe to a user and update its state to "paired".
	 * @param {number} probeId - The probe's database ID.
	 * @param {number} userId - The user's database ID.
	 * @returns {Promise<ProbeRecord>} The updated probe record.
	 */
	async assignToUser(probeId: number, userId: number): Promise<ProbeRecord> {
		const [probe] = await db("probes")
			.where("id", probeId)
			.update({ user_id: userId, state: "paired" })
			.returning("*");

		return probe;
	}

	/**
	 * @description Update a probe's battery voltage, WiFi RSSI, and last_seen timestamp.
	 * @param {string} hardwareId - The probe's hardware identifier.
	 * @param {number} batteryVoltage - Current battery voltage reading.
	 * @param {number} wifiRssi - Current WiFi signal strength in dBm.
	 * @returns {Promise<void>}
	 */
	async updateHealth(hardwareId: string, batteryVoltage: number, wifiRssi: number): Promise<void> {
		await db("probes")
			.where("hardware_id", hardwareId)
			.update({
				battery_voltage: batteryVoltage,
				wifi_rssi: wifiRssi,
				last_seen: db.fn.now(),
			});
	}

	/**
	 * @description Sync probe health from a sync/charging payload. Updates battery, wifi, last_seen, and is_charging flag.
	 * @param {string} hardwareId - The probe's hardware identifier.
	 * @param {number} batteryVoltage - Current battery voltage reading.
	 * @param {number} wifiRssi - Current WiFi signal strength in dBm.
	 * @param {boolean} isCharging - Whether the probe is currently charging.
	 * @returns {Promise<void>}
	 */
	async syncHealth(hardwareId: string, batteryVoltage: number, wifiRssi: number, isCharging: boolean): Promise<void> {
		await db("probes")
			.where("hardware_id", hardwareId)
			.update({
				battery_voltage: batteryVoltage,
				wifi_rssi: wifiRssi,
				is_charging: isCharging,
				last_seen: db.fn.now(),
			});
	}

	/**
	 * @description Update only the is_charging flag on a probe.
	 * @param {string} hardwareId - The probe's hardware identifier.
	 * @param {boolean} isCharging - Whether the probe is currently charging.
	 * @returns {Promise<void>}
	 */
	async updateCharging(hardwareId: string, isCharging: boolean): Promise<void> {
		await db("probes")
			.where("hardware_id", hardwareId)
			.update({ is_charging: isCharging });
	}

	/**
	 * @description Resolve a probe coming back online. Resets state to "paired" and closes any open PROBE_STALE issue for the linked plant.
	 * @param {number} probeId - The probe's database ID.
	 * @param {string} hardwareId - The probe's hardware identifier.
	 * @returns {Promise<void>}
	 */
	async resolveBackOnline(probeId: number, hardwareId: string): Promise<void> {
		const linked = await db("user_plants")
			.where("sonde_id", hardwareId)
			.where("is_active", true)
			.first("id");

		if (linked) {
			const staleIssue = await db("active_issues")
				.where("user_plant_id", linked.id)
				.where("issue_type", "PROBE_STALE")
				.whereNull("resolved_at")
				.first();

			if (staleIssue) {
				await db("active_issues")
					.where("id", staleIssue.id)
					.update({ resolved_at: db.fn.now() });
			}
		}

		await this.updateState(probeId, "paired");
	}

	/**
	 * @description Link a probe to a user plant by setting the plant's sonde_id to the probe's hardware_id.
	 * @param {string} hardwareId - The probe's hardware identifier.
	 * @param {number} userPlantId - The user plant's database ID.
	 * @returns {Promise<void>}
	 */
	async linkToUserPlant(hardwareId: string, userPlantId: number): Promise<void> {
		await db("user_plants")
			.where("id", userPlantId)
			.update({ sonde_id: hardwareId });
	}

	/**
	 * @description Unlink a probe from a user plant by setting the plant's sonde_id to null. Returns the previously linked hardware_id.
	 * @param {number} userPlantId - The user plant's database ID.
	 * @returns {Promise<string | null>} The unlinked hardware_id, or null if none was linked.
	 */
	async unlinkFromUserPlant(userPlantId: number): Promise<string | null> {
		const plant = await db("user_plants")
			.where("id", userPlantId)
			.first("sonde_id");

		if (!plant?.sonde_id) return null;

		await db("user_plants")
			.where("id", userPlantId)
			.update({ sonde_id: null });

		return plant.sonde_id;
	}

	/**
	 * @description Update a probe's friendly name.
	 * @param {number} probeId - The probe's database ID.
	 * @param {string} name - The new name for the probe.
	 * @returns {Promise<ProbeRecord>} The updated probe record.
	 */
	async updateState(probeId: number, state: "paired" | "available" | "offline"): Promise<ProbeRecord> {
		const [probe] = await db("probes")
			.where("id", probeId)
			.update({ state })
			.returning("*");

		return probe;
	}

	async rename(probeId: number, name: string): Promise<ProbeRecord> {
		const [probe] = await db("probes")
			.where("id", probeId)
			.update({ name })
			.returning("*");

		return probe;
	}
}
