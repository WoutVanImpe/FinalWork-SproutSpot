import { db } from "../db/connection";
import { ProbeRecord } from "../types/database";

export class ProbeRepository {
	/**
	 * @description Create a new probe record with hardware ID, name, and user association.
	 * @param {string} hardwareId - The probe's unique hardware identifier (MAC address).
	 * @param {string} name - Human-readable name for the probe.
	 * @param {number} userId - The user to assign this probe to (resolved via pairing code).
	 * @returns {Promise<ProbeRecord>} The created probe record.
	 */
	async create(hardwareId: string, name: string, userId: number): Promise<ProbeRecord> {
		const [probe] = await db("probes")
			.insert({
				hardware_id: hardwareId,
				name,
				user_id: userId,
				state: "available",
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
}
