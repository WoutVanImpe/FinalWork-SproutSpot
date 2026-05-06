import { TelemetryRepository } from "../repositories/telemetry.repository";
import { TelemetryPayloadDto } from "../types/dto";
import { ProbeEntryRecord } from "../types/database";

export class TelemetryService {
	private repository: TelemetryRepository;

	constructor() {
		this.repository = new TelemetryRepository();
	}

	/**
	 * @description Process and store telemetry data from a probe. Maps raw soil moisture to a percentage and updates probe battery/WiFi health in a single operation.
	 * @param {TelemetryPayloadDto} payload - Telemetry data containing hardware_id, temperature, humidity, light, soil raw value, battery voltage, and WiFi RSSI.
	 * @returns {Promise<ProbeEntryRecord>} The created probe entry record with mapped soil moisture.
	 */
	async uploadTelemetry(payload: TelemetryPayloadDto): Promise<ProbeEntryRecord> {
		const mappedSoil = this.mapSoilMoisture(payload.soil_raw);

		const entry = await this.repository.createEntry({
			...payload,
			soil_raw: mappedSoil,
		});

		await this.repository.updateProbeHealth(payload.hardware_id, payload.battery_voltage, payload.wifi_rssi);

		return entry;
	}

	/**
	 * @description Retrieve recent telemetry entries for a specific probe, ordered newest first.
	 * @param {string} sondeId - The probe's hardware identifier.
	 * @param {number} [limit=24] - Maximum number of entries to return.
	 * @returns {Promise<ProbeEntryRecord[]>} List of recent telemetry entries.
	 */
	async getRecentTelemetry(sondeId: string, limit: number = 24): Promise<ProbeEntryRecord[]> {
		return this.repository.getRecentEntriesBySondeId(sondeId, limit);
	}

	/**
	 * @description Retrieve recent telemetry entries for a probe linked to a specific user plant.
	 * @param {number} userPlantId - The user plant's database ID.
	 * @param {number} [limit=24] - Maximum number of entries to return.
	 * @returns {Promise<ProbeEntryRecord[]>} List of recent telemetry entries from the linked probe.
	 */
	async getRecentTelemetryByUserPlant(userPlantId: number, limit: number = 24): Promise<ProbeEntryRecord[]> {
		return this.repository.getRecentEntriesByUserPlantId(userPlantId, limit);
	}

	/**
	 * @description Map raw capacitive soil sensor values (200-400 range) to a 0-100% moisture percentage. Values below 200 return 100%, values above 400 return 0%.
	 * @param {number} rawValue - Raw soil sensor reading from the capacitive sensor.
	 * @returns {number} Mapped moisture percentage (0-100), where higher = more moist.
	 */
	mapSoilMoisture(rawValue: number): number {
		const DRY_THRESHOLD = 400;
		const WET_THRESHOLD = 200;

		if (rawValue <= WET_THRESHOLD) return 100;
		if (rawValue >= DRY_THRESHOLD) return 0;

		const percentage = ((rawValue - WET_THRESHOLD) / (DRY_THRESHOLD - WET_THRESHOLD)) * 100;
		return Math.round((100 - percentage) * 100) / 100;
	}
}
