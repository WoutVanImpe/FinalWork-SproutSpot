import { api } from "./api";

export interface ProbeBattery {
	level: string;
	percentage: number;
}

export interface ProbeWifi {
	quality: string;
	advice: string;
}

export interface LinkedPlant {
	nickname: string;
	name: string;
}

export interface ProbeInfo {
	id: number;
	hardware_id: string;
	name: string;
	state: string;
	battery_voltage: number;
	wifi_rssi: number;
	is_charging: boolean;
	last_seen: string;
	battery: ProbeBattery;
	wifi: ProbeWifi;
	linked_plant: LinkedPlant | null;
}

export function registerProbe(hardware_id: string, pairing_code: string) {
	return api.post<void>("/api/probes/register", { hardware_id, pairing_code });
}

export function syncProbe(hardware_id: string, battery_voltage: number, wifi_rssi: number) {
	return api.post<{ paired: boolean; state: string }>("/api/probes/sync", { hardware_id, battery_voltage, wifi_rssi });
}

export function getUserProbes() {
	return api.get<ProbeInfo[]>("/api/probes");
}

export function renameProbe(probeId: number, name: string) {
	return api.put<void>(`/api/probes/${probeId}/rename`, { name });
}

export function renameProbeByCode(pairingCode: string, name: string) {
	return api.post<{ id: number }>("/api/probes/rename-by-code", { pairing_code: pairingCode, name });
}

export function pairProbe(probeId: number, user_plant_id: number) {
	return api.post<void>(`/api/probes/${probeId}/pair`, { user_plant_id });
}

export function unpairProbe(userPlantId: number) {
	return api.post<void>(`/api/probes/unpair/${userPlantId}`);
}
