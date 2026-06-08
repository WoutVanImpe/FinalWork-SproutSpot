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
	warning: boolean;
}

export interface EnrichedGardenPlant {
	id: string;
	image: string;
	warning: boolean;
	probeOffline: boolean;
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
	return statuses.some((s) => s.warning);
}

function computeAdvice(openIssueTypes: string[]): string {
	if (openIssueTypes.includes("PROBE_STALE")) {
		return "Sonde reageert niet. Controleer de sonde en het wifi-netwerk.";
	}

	const issueAdvice: Record<string, string> = {
		SOIL_TOO_DRY: "Geef wat meer water",
		SOIL_TOO_WET: "Niet te veel water geven",
		LIGHT_TOO_LOW: "Plaats op een lichtere plek",
		LIGHT_TOO_HIGH: "Te veel direct zonlicht",
		TEMP_TOO_LOW: "Het is te koud voor deze plant",
		TEMP_TOO_HIGH: "Het is te warm voor deze plant",
	};
	return openIssueTypes
		.filter((t) => issueAdvice[t])
		.map((t) => issueAdvice[t])
		.join(". ") + (openIssueTypes.length > 0 ? "." : "");
}

export async function enrichPlant(
	rawPlant: any,
	stage: PlantStageRecord | null,
	allStages: PlantStageRecord[],
	latestTelemetry: ProbeEntryRecord | null,
	openIssueTypes: string[] = [],
): Promise<EnrichedGardenPlant> {
	const stageInfo = stage ? toStageInfo(stage) : { label: "Onbekend", durationDays: 0 };
	const stageLabel = stageInfo.label;
	const maxStages = allStages.length;

	const hasIssue = (types: string[]) => openIssueTypes.some((t) => types.includes(t));

	const probeStale = hasIssue(["PROBE_STALE"]);

	const waterStatus: PlantStatusData = {
		level: latestTelemetry?.soil_moist_pct ?? 50,
		label: WATER_MAP[rawPlant.water_label?.toLowerCase()] ?? rawPlant.water_label ?? "",
		optimalMin: stage?.thresholds?.soil_min ?? 30,
		optimalMax: stage?.thresholds?.soil_max ?? 80,
		warning: !probeStale && hasIssue(["SOIL_TOO_DRY", "SOIL_TOO_WET"]),
	};

	const lightStatus: PlantStatusData = {
		level: latestTelemetry?.light_lux != null ? Math.round((latestTelemetry.light_lux / 50000) * 100) : 50,
		label: LIGHT_MAP[rawPlant.light_label?.toLowerCase()] ?? rawPlant.light_label ?? "",
		optimalMin: stage?.thresholds?.light_min != null ? Math.round((stage.thresholds.light_min / 50000) * 100) : 40,
		optimalMax: stage?.thresholds?.light_max != null ? Math.round((stage.thresholds.light_max / 50000) * 100) : 80,
		warning: !probeStale && hasIssue(["LIGHT_TOO_LOW", "LIGHT_TOO_HIGH"]),
	};

	const tempStatus: PlantStatusData = {
		level: latestTelemetry?.temp_c ?? 20,
		label: `${rawPlant.temp_min ?? 0}°C - ${rawPlant.temp_max ?? 0}°C`,
		optimalMin: stage?.thresholds?.temp_min ?? 10,
		optimalMax: stage?.thresholds?.temp_max ?? 40,
		warning: !probeStale && hasIssue(["TEMP_TOO_LOW", "TEMP_TOO_HIGH"]),
	};

	const statuses = [waterStatus, lightStatus, tempStatus];

	const imageUrl = buildImageUrl(rawPlant.plant_image ?? "");
	const stageDefs = allStages.map((s) => toStageInfo(s));
	const totalDays = stageDefs.reduce((sum, s) => sum + s.durationDays, 0);

	const hasTelemetry = latestTelemetry != null;

	return {
		id: String(rawPlant.id),
		image: imageUrl,
		warning: hasTelemetry && (probeStale || computeWarning(statuses)),
		probeOffline: probeStale,
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
		advice: computeAdvice(openIssueTypes),
		battery: batteryPercentage(rawPlant.battery_voltage ?? 0),
		probe_name: rawPlant.probe_name ?? "",
		created_at: rawPlant.created_at ?? "",
		last_seen: rawPlant.last_seen ?? null,
		last_temp: latestTelemetry?.temp_c ?? 20,
	};
}

export async function enrichPlants(rawPlants: any[]): Promise<EnrichedGardenPlant[]> {
	const plantIds = rawPlants.map((p) => p.id);
	const allOpenIssues = plantIds.length > 0
		? await db("active_issues")
			.whereIn("user_plant_id", plantIds)
			.whereNull("resolved_at")
			.select("user_plant_id", "issue_type")
		: [];

	const issuesByPlant = new Map<number, string[]>();
	for (const issue of allOpenIssues) {
		const existing = issuesByPlant.get(issue.user_plant_id) ?? [];
		existing.push(issue.issue_type);
		issuesByPlant.set(issue.user_plant_id, existing);
	}

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
				issuesByPlant.get(rawPlant.id) ?? [],
			);
		} catch (err) {
			console.error("Failed to enrich plant", err);
			const imageUrl = buildImageUrl(rawPlant.plant_image ?? "");

			return {
				id: String(rawPlant.id),
				image: imageUrl,
				warning: false,
				probeOffline: false,
				hasTelemetry: false,
				x: rawPlant.x_pos,
				y: rawPlant.y_pos,
				nickname: rawPlant.nickname ?? rawPlant.plant_name ?? "Plant",
				type: rawPlant.plant_name ?? "",
				stage: { current: rawPlant.current_stage_order ?? 1, max: 1, label: "Onbekend" },
				stages: [],
				totalDays: 0,
				water: { level: 50, label: "", optimalMin: 30, optimalMax: 80, warning: false },
				light: { level: 50, label: "", optimalMin: 40, optimalMax: 80, warning: false },
				temperature: { level: 20, label: "", optimalMin: 10, optimalMax: 30, warning: false },
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
