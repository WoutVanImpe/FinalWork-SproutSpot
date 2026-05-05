import { db } from "../db/connection";
import { ProbeRecord } from "../types/database";

export class ProbeRepository {
	async create(hardwareId: string, name: string): Promise<ProbeRecord> {
		const [probe] = await db("probes")
			.insert({
				hardware_id: hardwareId,
				name,
				state: "available",
				battery_voltage: 0,
				wifi_rssi: 0,
			})
			.returning("*");

		return probe;
	}

	async findByHardwareId(hardwareId: string): Promise<ProbeRecord | undefined> {
		const probe = await db("probes").where("hardware_id", hardwareId).first();
		return probe;
	}

	async findById(id: number): Promise<ProbeRecord | undefined> {
		const probe = await db("probes").where("id", id).first();
		return probe;
	}

	async findByUserId(userId: number): Promise<ProbeRecord[]> {
		const probes = await db("probes")
			.where("user_id", userId)
			.orderBy("last_seen", "desc");

		return probes;
	}

	async pairProbe(probeId: number, userId: number): Promise<ProbeRecord> {
		const [probe] = await db("probes")
			.where("id", probeId)
			.update({
				user_id: userId,
				state: "paired",
			})
			.returning("*");

		return probe;
	}

	async unpairProbe(probeId: number): Promise<ProbeRecord> {
		const [probe] = await db("probes")
			.where("id", probeId)
			.update({
				user_id: null,
				state: "available",
			})
			.returning("*");

		return probe;
	}

	async updateHealth(probeId: number, batteryVoltage: number, wifiRssi: number): Promise<ProbeRecord> {
		const [probe] = await db("probes")
			.where("id", probeId)
			.update({
				battery_voltage: batteryVoltage,
				wifi_rssi: wifiRssi,
				last_seen: db.fn.now(),
			})
			.returning("*");

		return probe;
	}

	async markOffline(probeId: number): Promise<ProbeRecord> {
		const [probe] = await db("probes")
			.where("id", probeId)
			.update({ state: "offline" })
			.returning("*");

		return probe;
	}

	async getAvailableProbes(): Promise<ProbeRecord[]> {
		const probes = await db("probes")
			.where("state", "available")
			.orderBy("created_at", "desc");

		return probes;
	}
}
