import { api } from "./api";

export interface PlantStatusData {
	level: number;
	label: string;
	optimalMin: number;
	optimalMax: number;
}

export interface EnrichedPlant {
	id: string;
	image: string;
	warning: boolean;
	x: number;
	y: number;
	nickname: string;
	type: string;
	stage: { current: number; max: number; label: string };
	water: PlantStatusData;
	light: PlantStatusData;
	temperature: PlantStatusData;
	advice: string;
	battery: number;
	probe_name: string;
}

export interface GardenData {
	garden: {
		id: number;
		width: number;
		height: number;
	};
	plants: EnrichedPlant[];
}

export function getGarden() {
	return api.get<GardenData>("/api/gardens");
}

export function getDashboard() {
	return api.get<GardenData>("/api/gardens/status");
}

export function updateGarden(data: {
	width?: number;
	height?: number;
	plant_positions?: { id: string; x: number; y: number }[];
}) {
	return api.put<GardenData>("/api/gardens", data as Record<string, unknown>);
}

export interface CreateUserPlantResult {
	id: number;
}

export function createUserPlant(data: {
	plant_id: string;
	nickname: string;
	x_pos: number;
	y_pos: number;
	garden_id?: number;
}) {
	const numericPlantId = data.plant_id.replace("veg_", "");
	return api.post<CreateUserPlantResult>("/api/user-plants", {
		plant_id: numericPlantId,
		nickname: data.nickname,
		x_pos: data.x_pos,
		y_pos: data.y_pos,
		garden_id: data.garden_id,
	});
}

export function getUserPlants() {
	return api.get<unknown[]>("/api/user-plants");
}

export function getCurrentStage(userPlantId: number) {
	return api.get<{ current: number; max: number; label: string }>(`/api/user-plants/${userPlantId}/stage`);
}

export function advanceStage(userPlantId: number, new_stage_order: number) {
	return api.post<void>(`/api/user-plants/${userPlantId}/stage`, { new_stage_order });
}

export interface ReadingRecord {
	id: number;
	sonde_id: string | null;
	temp_c: number | null;
	humidity_pct: number | null;
	light_lux: number | null;
	soil_moist_pct: number | null;
	battery_voltage: number;
	wifi_rssi: number;
	created_at: string;
}

export function getReadings(userPlantId: number, hours?: number) {
	return api.get<ReadingRecord[]>(`/api/user-plants/${userPlantId}/readings${hours ? `?hours=${hours}` : ""}`);
}
