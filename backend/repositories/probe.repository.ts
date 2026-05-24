import { db } from "../db/connection";
import { ProbeRecord, UserPlantRecord } from "../types/database";

export interface StaleProbeResult {
	probe: ProbeRecord;
	userPlant: UserPlantRecord;
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
	 * @description Retrieve all probes belonging to a user, ordered by last_seen descending.
	 * @param {number} userId - The user's database ID.
	 * @returns {Promise<ProbeRecord[]>} List of probe records.
	 */
	async findByUserId(userId: number): Promise<ProbeRecord[]> {
		return db("probes")
			.where("user_id", userId)
			.orderBy("last_seen", "desc");
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
	 * @description Unlink a probe from a user plant by setting the plant's sonde_id to null.
	 * @param {number} userPlantId - The user plant's database ID.
	 * @returns {Promise<void>}
	 */
	async unlinkFromUserPlant(userPlantId: number): Promise<void> {
		await db("user_plants")
			.where("id", userPlantId)
			.update({ sonde_id: null });
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
