import { PlantRecord, PlantStageRecord } from "../types/database";
import { buildImageUrl } from "../config";

export interface PlantListItem {
	id: string;
	name: string;
	image: string;
	placement: "inside" | "outside" | "both";
	sunlight: string;
	sowingPeriod: { startMonth: number; endMonth: number };
	careLevel: string;
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
	stages: { label: string; durationDays: number }[];
	totalDays: number;
	placement: "inside" | "outside" | "both";
	sunlight: string;
	careLevel: string;
}

export interface StageInfo {
	label: string;
	durationDays: number;
}

const LIGHT_MAP: Record<string, string> = {
	"full sun": "Volle zon",
	"partial shade": "Halfschaduw",
	"shade": "Schaduw",
};

const WATER_MAP: Record<string, string> = {
	"low": "Weinig water",
	"moderate": "Regelmatig",
	"high": "Veel water",
};

const DIFFICULTY_MAP: Record<string, string> = {
	"easy": "Gemakkelijk",
	"medium": "Gemiddeld",
	"hard": "Moeilijk",
};

const MONTH_MAP: Record<string, number> = {
	january: 1,	february: 2, march: 3, april: 4,
	may: 5, june: 6, july: 7, august: 8,
	september: 9, october: 10, november: 11, december: 12,
};

const PLACEMENT_MAP: Record<string, "inside" | "outside" | "both"> = {
	indoor: "inside",
	outdoor: "outside",
	both: "both",
};

function translateLight(val: string | null | undefined): string {
	if (!val) return "";
	return LIGHT_MAP[val.toLowerCase()] ?? val;
}

function translateWater(val: string | null | undefined): string {
	if (!val) return "";
	return WATER_MAP[val.toLowerCase()] ?? val;
}

function translateDifficulty(val: string | null | undefined): string {
	if (!val) return "";
	return DIFFICULTY_MAP[val.toLowerCase()] ?? val;
}

function mapPlacement(val: string | null | undefined): "inside" | "outside" | "both" {
	if (!val) return "both";
	return PLACEMENT_MAP[val.toLowerCase()] ?? "both";
}

function parseSowingPeriod(months: string[] | null | undefined): { startMonth: number; endMonth: number } {
	if (!months || months.length < 2) return { startMonth: 1, endMonth: 12 };
	const start = MONTH_MAP[months[0]?.toLowerCase() ?? ""] ?? 1;
	const end = MONTH_MAP[months[months.length - 1]?.toLowerCase() ?? ""] ?? 12;
	return { startMonth: start, endMonth: end };
}

function formatDepth(val: number | null | undefined): string {
	if (val == null) return "";
	return `${val} cm`;
}

export function toPlantListItem(plant: PlantRecord): PlantListItem {
	return {
		id: `veg_${plant.id}`,
		name: plant.name,
		image: buildImageUrl(plant.image),
		placement: mapPlacement(plant.planting_type),
		sunlight: plant.sunlight ?? "",
		sowingPeriod: parseSowingPeriod(plant.sowing_period),
		careLevel: plant.care_level ?? "",
	};
}

export function toPlantDetail(plant: PlantRecord, stages: PlantStageRecord[]): PlantDetail {
	return {
		id: `veg_${plant.id}`,
		name: plant.name,
		image: buildImageUrl(plant.image),
		light: translateLight(plant.light),
		water: translateWater(plant.water),
		difficulty: translateDifficulty(plant.difficulty),
		temperature: {
			min: plant.temperature_min ?? 0,
			max: plant.temperature_max ?? 0,
		},
		sowingPeriod: parseSowingPeriod(plant.sowing_period),
		sowingDepth: formatDepth(plant.sowing_depth),
		sowingDistance: formatDepth(plant.sowing_distance),
		potDepth: formatDepth(plant.pot_min_depth),
		stages: stages.map(toStageInfo),
		totalDays: plant.total_days ?? 0,
		placement: mapPlacement(plant.planting_type),
		sunlight: plant.sunlight ?? "",
		careLevel: plant.care_level ?? "",
	};
}

export function toStageInfo(stage: PlantStageRecord): StageInfo {
	return {
		label: stage.stage_name,
		durationDays: stage.duration_days,
	};
}
