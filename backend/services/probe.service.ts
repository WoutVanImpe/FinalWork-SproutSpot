import { ProbeRepository } from "../repositories/probe.repository";
import { ProbeRecord } from "../types/database";
import { ProbeHealthResponse, ProbeWifiResponse } from "../types/response";

export class ProbeService {
	private repository: ProbeRepository;

	constructor() {
		this.repository = new ProbeRepository();
	}

	/**
	 * @description Register a new probe with its unique hardware ID (MAC address) and a friendly name. Fails if the hardware ID already exists.
	 * @param {string} hardwareId - The probe's unique hardware identifier (MAC address).
	 * @param {string} name - Human-readable name for the probe.
	 * @returns {Promise<ProbeRecord>} The created probe record.
	 */
	async registerProbe(hardwareId: string, name: string): Promise<ProbeRecord> {
		const existing = await this.repository.findByHardwareId(hardwareId);

		if (existing) {
			throw new Error("Probe with this hardware ID already exists");
		}

		return this.repository.create(hardwareId, name);
	}

	/**
	 * @description Pair a probe to a user plant by linking the probe's hardware_id to the plant's sonde_id field.
	 * @param {number} probeId - The probe's database ID.
	 * @param {number} userPlantId - The user plant's database ID to link to.
	 * @returns {Promise<ProbeRecord>} The probe record.
	 */
	async pairProbe(probeId: number, userPlantId: number): Promise<ProbeRecord> {
		const probe = await this.repository.findById(probeId);

		if (!probe) {
			throw new Error("Probe not found");
		}

		await this.repository.linkToUserPlant(probe.hardware_id, userPlantId);

		return probe;
	}

	/**
	 * @description Unpair a probe from a user plant by setting the plant's sonde_id to null.
	 * @param {number} userPlantId - The user plant's database ID to unlink.
	 * @returns {Promise<void>}
	 */
	async unpairProbe(userPlantId: number): Promise<void> {
		await this.repository.unlinkFromUserPlant(userPlantId);
	}

	/**
	 * @description Retrieve probes belonging to a user. If probeId is provided, returns a single probe; otherwise returns all probes.
	 * @param {number} userId - The user's database ID.
	 * @param {number} [probeId] - Optional probe ID to filter to a single probe.
	 * @returns {Promise<ProbeRecord[] | ProbeRecord>} Single probe record or array of all probes.
	 */
	async getUserProbes(userId: number, probeId?: number): Promise<ProbeRecord[] | ProbeRecord> {
		if (probeId) {
			const probe = await this.repository.findById(probeId);

			if (!probe || probe.user_id !== userId) {
				throw new Error("Probe not found");
			}

			return probe;
		}

		return this.repository.findByUserId(userId);
	}

	/**
	 * @description Calculate battery health as a percentage and human-readable level based on LiPo voltage (3.0V-4.2V range).
	 * @param {number} batteryVoltage - Current battery voltage reading.
	 * @returns {ProbeHealthResponse} Object with level ("Good"/"Medium"/"Low"/"Critical") and percentage (0-100).
	 */
	getBatteryStatus(batteryVoltage: number): ProbeHealthResponse {
		const MIN_VOLTAGE = 3.0;
		const MAX_VOLTAGE = 4.2;

		const percentage = Math.round(((batteryVoltage - MIN_VOLTAGE) / (MAX_VOLTAGE - MIN_VOLTAGE)) * 100);
		const clampedPercentage = Math.max(0, Math.min(100, percentage));

		let level: string;
		if (clampedPercentage > 70) level = "Good";
		else if (clampedPercentage > 30) level = "Medium";
		else if (clampedPercentage > 10) level = "Low";
		else level = "Critical";

		return { level, percentage: clampedPercentage };
	}

	/**
	 * @description Evaluate WiFi signal quality based on RSSI value and return a human-readable assessment with advice.
	 * @param {number} rssi - WiFi signal strength in dBm (typically -30 to -90).
	 * @returns {ProbeWifiResponse} Object with quality ("Excellent"/"Good"/"Fair"/"Poor") and actionable advice.
	 */
	getWifiStatus(rssi: number): ProbeWifiResponse {
		if (rssi >= -60) return { quality: "Excellent", advice: "Connection is strong" };
		if (rssi >= -70) return { quality: "Good", advice: "Connection is stable" };
		if (rssi >= -80) return { quality: "Fair", advice: "Consider moving closer to your router" };
		return { quality: "Poor", advice: "WiFi signal is weak, data may be delayed" };
	}
}
