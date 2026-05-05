import { TelemetryRepository } from "../repositories/telemetry.repository";
import { NotificationService } from "../services/notification.service";
import { TelemetryPayloadDto } from "../types/dto";
import { ProbeEntryRecord } from "../types/database";
import { IssueResultResponse } from "../types/response";
import { ANTI_SPAM_MEASUREMENT_THRESHOLD } from "../config";

export class TelemetryService {
	private repository: TelemetryRepository;
	private notificationService: NotificationService;

	constructor() {
		this.repository = new TelemetryRepository();
		this.notificationService = new NotificationService();
	}

	async processTelemetry(payload: TelemetryPayloadDto) {
		const mappedSoil = this.mapSoilMoisture(payload.soil_raw);

		const entry = await this.repository.createEntry({
			...payload,
			soil_raw: mappedSoil,
		});

		await this.repository.updateProbeHealth(payload.hardware_id, payload.battery_voltage, payload.wifi_rssi);

		const userPlant = await this.repository.getActiveUserPlantBySondeId(payload.hardware_id);

		if (!userPlant) {
			return {
				entry,
				message: "Telemetry stored. No active plant linked to this probe.",
				issues: [],
			};
		}

		const thresholds = userPlant.thresholds as {
			soil_min: number;
			soil_max: number;
			temp_min: number;
			temp_max: number;
			humidity_min: number;
			humidity_max: number;
			light_min: number;
			light_max: number;
		} | null;

		if (!thresholds) {
			return {
				entry,
				message: "Telemetry stored. No growth stage thresholds configured.",
				issues: [],
			};
		}

		const issues = this.evaluateConditions({
			temp_c: payload.temp_c,
			humidity_pct: payload.humidity_pct,
			light_lux: payload.light_lux,
			soil_moist_pct: mappedSoil,
			thresholds,
			userPlantId: userPlant.user_plant_id,
			sondeId: payload.hardware_id,
			userId: userPlant.user_id,
			plantName: userPlant.plant_name,
		});

		return {
			entry,
			message: "Telemetry processed successfully.",
			issues,
		};
	}

	mapSoilMoisture(rawValue: number): number {
		const DRY_THRESHOLD = 400;
		const WET_THRESHOLD = 200;

		if (rawValue <= WET_THRESHOLD) {
			return 100;
		}

		if (rawValue >= DRY_THRESHOLD) {
			return 0;
		}

		const percentage = ((rawValue - WET_THRESHOLD) / (DRY_THRESHOLD - WET_THRESHOLD)) * 100;
		return Math.round((100 - percentage) * 100) / 100;
	}

	private evaluateConditions(params: {
		temp_c: number;
		humidity_pct: number;
		light_lux: number;
		soil_moist_pct: number;
		thresholds: { soil_min: number; soil_max: number; temp_min: number; temp_max: number; humidity_min: number; humidity_max: number; light_min: number; light_max: number };
		userPlantId: number;
		sondeId: string;
		userId: number;
		plantName: string;
	}): IssueResultResponse[] {
		const { temp_c, humidity_pct, light_lux, soil_moist_pct, thresholds, userPlantId, sondeId, userId, plantName } = params;
		const issues: IssueResultResponse[] = [];

		if (soil_moist_pct < thresholds.soil_min) {
			issues.push({
				issue_type: "low_soil_moisture",
				severity: thresholds.soil_min - soil_moist_pct > 20 ? "critical" : "warning",
				message: `${plantName} is thirsty`,
				coach_advice: "The soil feels dry. Give it a small drink and check again later.",
			});
		}

		if (temp_c < thresholds.temp_min) {
			issues.push({
				issue_type: "low_temperature",
				severity: "warning",
				message: `${plantName} is feeling chilly`,
				coach_advice: "This plant prefers warmth. Try moving it to a cozier spot away from drafts.",
			});
		}

		if (temp_c > thresholds.temp_max) {
			issues.push({
				issue_type: "high_temperature",
				severity: "warning",
				message: `${plantName} is too warm`,
				coach_advice: "It might be too hot here. Try a shadier spot to keep it comfortable.",
			});
		}

		if (light_lux < thresholds.light_min) {
			issues.push({
				issue_type: "low_light",
				severity: "warning",
				message: `${plantName} needs more light`,
				coach_advice: "This spot is a bit too dark. A windowsill with indirect sunlight would be perfect.",
			});
		}

		if (issues.length > 0) {
			this.handleIssues(issues, userPlantId, sondeId);
		}

		return issues;
	}

	private async handleIssues(issues: IssueResultResponse[], userPlantId: number, sondeId: string) {
		const recentEntries = await this.repository.getRecentEntriesBySondeId(sondeId, ANTI_SPAM_MEASUREMENT_THRESHOLD);

		const shouldAlert = recentEntries.length >= ANTI_SPAM_MEASUREMENT_THRESHOLD;

		if (shouldAlert) {
			for (const issue of issues) {
				await this.notificationService.createOrUpdateIssue({
					userPlantId,
					issueType: issue.issue_type,
				});
			}
		}
	}

	async getRecentTelemetry(sondeId: string, limit: number = 24): Promise<ProbeEntryRecord[]> {
		return this.repository.getRecentEntriesBySondeId(sondeId, limit);
	}
}
