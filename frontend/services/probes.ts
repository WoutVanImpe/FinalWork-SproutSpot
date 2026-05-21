import { api } from "./api";

export interface ProbeInfo {
	id: number;
	hardware_id: string;
	name: string;
	state: string;
	battery: number;
	wifi_rssi: number;
}

export function registerProbe(hardware_id: string, pairing_code: string) {
	return api.post<void>("/api/probes/register", { hardware_id, pairing_code });
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
