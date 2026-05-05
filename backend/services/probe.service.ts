import { ProbeRepository } from "../repositories/probe.repository";
import { ProbeRecord } from "../types/database";
import { ProbeHealthResponse, ProbeWifiResponse } from "../types/response";
import { DEEP_SLEEP_INTERVAL_MINUTES } from "../config";

export class ProbeService {
	private repository: ProbeRepository;

	constructor() {
		this.repository = new ProbeRepository();
	}

	async registerProbe(hardwareId: string, name: string): Promise<ProbeRecord> {
		const existing = await this.repository.findByHardwareId(hardwareId);

		if (existing) {
			throw new Error("Probe with this hardware ID already exists");
		}

		return this.repository.create(hardwareId, name);
	}

	async pairProbe(probeId: number, userId: number): Promise<ProbeRecord> {
		const probe = await this.repository.findById(probeId);

		if (!probe) {
			throw new Error("Probe not found");
		}

		if (probe.state === "paired" && probe.user_id === userId) {
			throw new Error("Probe is already paired to your account");
		}

		return this.repository.pairProbe(probeId, userId);
	}

	async unpairProbe(probeId: number, userId: number): Promise<ProbeRecord> {
		const probe = await this.repository.findById(probeId);

		if (!probe) {
			throw new Error("Probe not found");
		}

		if (probe.user_id !== userId) {
			throw new Error("You do not own this probe");
		}

		return this.repository.unpairProbe(probeId);
	}

	async getUserProbes(userId: number): Promise<ProbeRecord[]> {
		return this.repository.findByUserId(userId);
	}

	async getAvailableProbes(): Promise<ProbeRecord[]> {
		return this.repository.getAvailableProbes();
	}

	async updateHealth(probeId: number, batteryVoltage: number, wifiRssi: number): Promise<ProbeRecord> {
		const probe = await this.repository.findById(probeId);

		if (!probe) {
			throw new Error("Probe not found");
		}

		return this.repository.updateHealth(probeId, batteryVoltage, wifiRssi);
	}

	async checkProbeHealth(): Promise<ProbeRecord[]> {
		const offlineThreshold = new Date();
		offlineThreshold.setMinutes(offlineThreshold.getMinutes() - (DEEP_SLEEP_INTERVAL_MINUTES * 3));

		const probes = await this.repository.findByUserId(0);
		const offlineProbes: ProbeRecord[] = [];

		for (const probe of probes) {
			const lastSeen = new Date(probe.last_seen);
			if (lastSeen < offlineThreshold && probe.state !== "offline") {
				await this.repository.markOffline(probe.id);
				offlineProbes.push({ ...probe, state: "offline" });
			}
		}

		return offlineProbes;
	}

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

	getWifiStatus(rssi: number): ProbeWifiResponse {
		if (rssi >= -60) return { quality: "Excellent", advice: "Connection is strong" };
		if (rssi >= -70) return { quality: "Good", advice: "Connection is stable" };
		if (rssi >= -80) return { quality: "Fair", advice: "Consider moving closer to your router" };
		return { quality: "Poor", advice: "WiFi signal is weak, data may be delayed" };
	}
}
