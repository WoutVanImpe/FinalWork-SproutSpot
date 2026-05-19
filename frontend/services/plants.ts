import { api } from "./api";

export interface PlantListItem {
	id: string;
	name: string;
	image: string;
	placement: "inside" | "outside" | "both";
	sunlight: string;
	sowingPeriod: { startMonth: number; endMonth: number };
	careLevel: string;
}

export interface StageInfo {
	label: string;
	durationDays: number;
}

export interface PlantDetail {
	id: string;
	name: string;
	image: string;
	light: string;
	water: string;
	difficulty: string;
	temperature: { min: number; max: number };
	sowingPeriod: { startMonth: number; endMonth: number };
	sowingDepth: string;
	sowingDistance: string;
	potDepth: string;
	stages: StageInfo[];
	totalDays: number;
	placement: "inside" | "outside" | "both";
	sunlight: string;
	careLevel: string;
}

export function getAllPlants() {
	return api.get<PlantListItem[]>("/api/plants");
}

export function getPlantById(id: string) {
	const numericId = id.replace("veg_", "");
	return api.get<PlantDetail>(`/api/plants/${numericId}`);
}

export function searchPlants(params: {
	q?: string;
	light?: string;
	difficulty?: string;
	is_indoor?: boolean;
	sowing_month?: number;
	sunlight?: string;
	care_level?: string;
}) {
	const query = new URLSearchParams();
	if (params.q) query.set("q", params.q);
	if (params.light) query.set("light", params.light);
	if (params.difficulty) query.set("difficulty", params.difficulty);
	if (params.is_indoor !== undefined) query.set("is_indoor", String(params.is_indoor));
	if (params.sowing_month) query.set("sowing_month", String(params.sowing_month));
	if (params.sunlight) query.set("sunlight", params.sunlight);
	if (params.care_level) query.set("care_level", params.care_level);
	const qs = query.toString();
	return api.get<PlantListItem[]>(`/api/plants/search${qs ? "?" + qs : ""}`);
}

export function getPlantStages(id: string) {
	const numericId = id.replace("veg_", "");
	return api.get<StageInfo | StageInfo[]>(`/api/plants/${numericId}/stages`);
}
