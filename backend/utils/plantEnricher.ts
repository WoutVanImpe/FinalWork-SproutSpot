import { db } from "../db/connection";
import { ProbeEntryRecord, PlantStageRecord } from "../types/database";
import { toStageInfo, LIGHT_MAP, WATER_MAP } from "./plantMapper";
import { buildImageUrl } from "../config";
import { batteryPercentage } from "./battery";

export interface PlantStatusData {
	level: number;
	label: string;
	optimalMin: number;
	optimalMax: number;
}

export interface EnrichedGardenPlant {
	id: string;
	image: string;
	warning: boolean;
	hasTelemetry: boolean;
	x: number;
	y: number;
	nickname: string;
	type: string;
	stage: { current: number; max: number; label: string };
	stages: { label: string; durationDays: number }[];
	totalDays: number;
	water: PlantStatusData;
	light: PlantStatusData;
	temperature: PlantStatusData;
	advice: string;
	battery: number;
	probe_name: string;
	created_at: string;
	last_seen: string | null;
	last_temp: number;
}

function computeWarning(statuses: PlantStatusData[]): boolean {
	return statuses.some((s) => s.level < s.optimalMin || s.level > s.optimalMax);
}

function computeAdvice(statuses: { label: string; data: PlantStatusData }[]): string {
	const alerts: string[] = [];
	for (const s of statuses) {
		if (s.data.level < s.data.optimalMin) {
			if (s.label === "water") alerts.push("Geef wat meer water");
			else if (s.label === "light") alerts.push("Plaats op een lichtere plek");
			else if (s.label === "temperature") alerts.push("Het is te koud voor deze plant");
		} else if (s.data.level > s.data.optimalMax) {
			if (s.label === "water") alerts.push("Niet te veel water geven");
			else if (s.label === "light") alerts.push("Te veel direct zonlicht");
			else if (s.label === "temperature") alerts.push("Het is te warm voor deze plant");
		}
	}
	return alerts.join(". ") + (alerts.length > 0 ? "." : "");
}

export async function enrichPlant(
	rawPlant: any,
	stage: PlantStageRecord | null,
	allStages: PlantStageRecord[],
	latestTelemetry: ProbeEntryRecord | null,
): Promise<EnrichedGardenPlant> {
	const stageInfo = stage ? toStageInfo(stage) : { label: "Onbekend", durationDays: 0 };
	const stageLabel = stageInfo.label;
	const maxStages = allStages.length;

	const waterStatus: PlantStatusData = {
		level: latestTelemetry?.soil_moist_pct ?? 50,
		label: WATER_MAP[rawPlant.water_label?.toLowerCase()] ?? rawPlant.water_label ?? "",
		optimalMin: stage?.thresholds?.soil_min ?? 30,
		optimalMax: stage?.thresholds?.soil_max ?? 80,
	};

	const lightStatus: PlantStatusData = {
		level: latestTelemetry?.light_lux != null ? Math.round((latestTelemetry.light_lux / 50000) * 100) : 50,
		label: LIGHT_MAP[rawPlant.light_label?.toLowerCase()] ?? rawPlant.light_label ?? "",
		optimalMin: stage?.thresholds?.light_min != null ? Math.round((stage.thresholds.light_min / 50000) * 100) : 40,
		optimalMax: stage?.thresholds?.light_max != null ? Math.round((stage.thresholds.light_max / 50000) * 100) : 80,
	};

	const tempStatus: PlantStatusData = {
		level: latestTelemetry?.temp_c ?? 20,
		label: `${rawPlant.temp_min ?? 0}°C - ${rawPlant.temp_max ?? 0}°C`,
		optimalMin: stage?.thresholds?.temp_min ?? 10,
		optimalMax: stage?.thresholds?.temp_max ?? 30,
	};

	const statuses = [waterStatus, lightStatus, tempStatus];
	const namedStatuses = [
		{ label: "water", data: waterStatus },
		{ label: "light", data: lightStatus },
		{ label: "temperature", data: tempStatus },
	];

	const imageUrl = buildImageUrl(rawPlant.plant_image ?? "");
	const stageDefs = allStages.map((s) => toStageInfo(s));
	const totalDays = stageDefs.reduce((sum, s) => sum + s.durationDays, 0);

	const hasTelemetry = latestTelemetry != null;

	return {
		id: String(rawPlant.id),
		image: imageUrl,
		warning: hasTelemetry && computeWarning(statuses),
		hasTelemetry,
		x: rawPlant.x_pos,
		y: rawPlant.y_pos,
		nickname: rawPlant.nickname ?? rawPlant.plant_name ?? "Plant",
		type: rawPlant.plant_name ?? "",
		stage: {
			current: rawPlant.current_stage_order ?? 1,
			max: maxStages,
			label: stageLabel,
		},
		stages: stageDefs,
		totalDays,
		water: waterStatus,
		light: lightStatus,
		temperature: tempStatus,
		advice: computeAdvice(namedStatuses),
		battery: batteryPercentage(rawPlant.battery_voltage ?? 0),
		probe_name: rawPlant.probe_name ?? "",
		created_at: rawPlant.created_at ?? "",
		last_seen: rawPlant.last_seen ?? null,
		last_temp: latestTelemetry?.temp_c ?? 20,
	};
}

export async function enrichPlants(rawPlants: any[]): Promise<EnrichedGardenPlant[]> {
	const plantPromises = rawPlants.map(async (rawPlant) => {
		try {
			const allStages = await db("plant_stages")
				.where("plant_id", rawPlant.plant_id)
				.orderBy("stage_order", "asc");

			const currentStage = allStages.find((s: any) => s.stage_order === rawPlant.current_stage_order) ?? null;

			let latestTelemetry: ProbeEntryRecord | null = null;
			if (rawPlant.sonde_id) {
				const entries = await db("probe_entries")
					.where("sonde_id", rawPlant.sonde_id)
					.orderBy("created_at", "desc")
					.limit(1);
				latestTelemetry = entries[0] ?? null;
			}

			const plantRecord = await db("plants").where("id", rawPlant.plant_id).first();

			return enrichPlant(
				{ ...rawPlant, water_label: plantRecord?.water ?? "", light_label: plantRecord?.light ?? "", temp_min: plantRecord?.temperature_min, temp_max: plantRecord?.temperature_max },
				currentStage,
				allStages,
				latestTelemetry,
			);
		} catch {
			const imageUrl = buildImageUrl(rawPlant.plant_image ?? "");

			return {
				id: String(rawPlant.id),
				image: imageUrl,
				warning: false,
				hasTelemetry: false,
				x: rawPlant.x_pos,
				y: rawPlant.y_pos,
				nickname: rawPlant.nickname ?? rawPlant.plant_name ?? "Plant",
				type: rawPlant.plant_name ?? "",
				stage: { current: rawPlant.current_stage_order ?? 1, max: 1, label: "Onbekend" },
				stages: [],
				totalDays: 0,
				water: { level: 50, label: "", optimalMin: 30, optimalMax: 80 },
				light: { level: 50, label: "", optimalMin: 40, optimalMax: 80 },
				temperature: { level: 20, label: "", optimalMin: 10, optimalMax: 30 },
				advice: "",
				battery: batteryPercentage(rawPlant.battery_voltage ?? 0),
				probe_name: rawPlant.probe_name ?? "",
				created_at: rawPlant.created_at ?? "",
				last_seen: rawPlant.last_seen ?? null,
				last_temp: 20,
			};
		}
	});

	return Promise.all(plantPromises);
}
