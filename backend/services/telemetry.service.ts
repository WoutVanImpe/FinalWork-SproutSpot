import { TelemetryRepository } from "../repositories/telemetry.repository";
import { ProbeRepository, StaleProbeResult } from "../repositories/probe.repository";
import { PushNotificationService } from "./push-notification.service";
import { TelemetryBatchUploadDto, TelemetryEntryDto } from "../types/dto";
import { ActiveIssueRecord, ProbeEntryRecord, StageThresholdsRecord, UserPlantRecord } from "../types/database";

interface Anomaly {
	type: string;
	metric: string;
	value: number;
	limit: number;
}

interface MeasurementSample {
	temp_c: number;
	light_lux: number;
	soil_moist_pct: number;
	created_at: Date;
}

export class TelemetryService {
	private repository: TelemetryRepository;
	private probeRepository: ProbeRepository;
	private pushNotificationService: PushNotificationService;

	constructor() {
		this.repository = new TelemetryRepository();
		this.probeRepository = new ProbeRepository();
		this.pushNotificationService = new PushNotificationService();
	}

	private batteryPercentage(voltage: number): number {
		const MIN_VOLTAGE = 3.0;
		const MAX_VOLTAGE = 4.2;
		const pct = Math.round(((voltage - MIN_VOLTAGE) / (MAX_VOLTAGE - MIN_VOLTAGE)) * 100);
		return Math.max(0, Math.min(100, pct));
	}

	async uploadTelemetry(payload: TelemetryBatchUploadDto): Promise<ProbeEntryRecord[]> {
		const { hardware_id, entries } = payload;

		const probe = await this.probeRepository.findByHardwareId(hardware_id);
		if (!probe) {
			throw new Error("Probe not registered");
		}

		const linked = await this.repository.findActivePlantByProbe(hardware_id);
		if (!linked) {
			console.warn(`[Telemetry] Probe ${hardware_id} is active but not paired to a plant. Skipping threshold evaluation.`);
		}

		const mappedEntries: TelemetryEntryDto[] = entries.map((entry) => ({
			...entry,
			soil_raw: this.mapSoilMoisture(entry.soil_raw),
		}));

		const created = await this.repository.createEntries(hardware_id, mappedEntries);

		const lastEntry = entries[entries.length - 1]!;
		await this.repository.updateProbeHealth(hardware_id, lastEntry.battery_voltage, lastEntry.wifi_rssi);

		if (linked) {
			await this.processAnomalies(mappedEntries, linked, hardware_id);
		}

		await this.checkBattery(lastEntry.battery_voltage, linked?.userPlant?.id, linked?.userPlant?.user_id, linked?.userPlant?.nickname ?? null);

		// Auto-resolve PROBE_STALE when probe comes back online
		if (linked) {
			const openIssues = await this.repository.findOpenIssuesByUserPlant(linked.userPlant.id);
			const staleIssue = openIssues.find((i) => i.issue_type === "PROBE_STALE");
			if (staleIssue) {
				console.log(`[Telemetry] Auto-resolving PROBE_STALE (issue #${staleIssue.id}) — probe ${hardware_id} is sending data again`);
				await this.repository.resolveIssue(staleIssue.id);
				await this.probeRepository.updateState(probe.id, "paired");
			}
		}

		return created;
	}

	private async processAnomalies(
		batchEntries: TelemetryEntryDto[],
		linked: { userPlant: UserPlantRecord; thresholds: StageThresholdsRecord },
		hardwareId: string,
	): Promise<void> {
		const { thresholds } = linked;
		const userPlantId = linked.userPlant.id;
		const userId = linked.userPlant.user_id;
		const plantNickname = linked.userPlant.nickname;

		const earliestBatchTime = batchEntries.reduce(
			(earliest, e) => (e.time_t < earliest ? e.time_t : earliest),
			batchEntries[0]!.time_t,
		);

		const historical = await this.repository.getRecentEntriesBefore(
			hardwareId,
			new Date(earliestBatchTime * 1000),
			2,
		);

		const batchSamples: MeasurementSample[] = batchEntries.map((e) => ({
			temp_c: e.temp_c,
			light_lux: e.light_lux,
			soil_moist_pct: e.soil_raw,
			created_at: new Date(e.time_t * 1000),
		}));

		const histSamples: MeasurementSample[] = historical.map((e) => ({
			temp_c: e.temp_c ?? 0,
			light_lux: e.light_lux ?? 0,
			soil_moist_pct: e.soil_moist_pct ?? 0,
			created_at: new Date(e.created_at),
		}));

		const allSamples = [...histSamples, ...batchSamples].sort(
			(a, b) => a.created_at.getTime() - b.created_at.getTime(),
		);

		const latest = allSamples[allSamples.length - 1]!;

		// Soil — instant trigger, no anti-spam
		await this.checkAndActOnMetric(
			"soil_moisture",
			latest.soil_moist_pct,
			{ min: thresholds.soil_min, max: thresholds.soil_max },
			"instant",
			allSamples,
			userPlantId,
			["SOIL_TOO_DRY", "SOIL_TOO_WET"],
			userId,
			plantNickname,
		);

		// Temperature — persistent guard (3 consecutive)
		await this.checkAndActOnMetric(
			"temperature",
			latest.temp_c,
			{ min: thresholds.temp_min, max: thresholds.temp_max },
			"persistent",
			allSamples,
			userPlantId,
			["TEMP_TOO_LOW", "TEMP_TOO_HIGH"],
			userId,
			plantNickname,
		);

		// Light — high-light protection only (3 consecutive, prevents sunburn)
		// LIGHT_TOO_LOW is handled by daily cumulative DLI check in scheduler
		if (latest.light_lux > thresholds.light_max) {
			const required = 3;
			let consecutive = 0;

			for (let i = allSamples.length - 1; i >= 0; i--) {
				const val = allSamples[i]!.light_lux;
				if (val > thresholds.light_max) {
					consecutive++;
					if (consecutive >= required) break;
				} else {
					break;
				}
			}

			if (consecutive >= required) {
				console.log(`[Telemetry] LIGHT_TOO_HIGH — value=${latest.light_lux}, limit=${thresholds.light_max} (persistent trigger, ${consecutive} consecutive)`);
				const { issue, isNew } = await this.upsertIssue(userPlantId, "LIGHT_TOO_HIGH");
				if (isNew) {
					await this.dispatchNotificationForIssue(issue, userId, userPlantId, plantNickname);
				}
			} else {
				console.log(`[Telemetry] LIGHT_TOO_HIGH filtered by anti-spam — only ${consecutive} consecutive out-of-range readings (need ${required})`);
			}
		}

		// Auto-resolve
		await this.autoResolveIssues(allSamples, userPlantId, thresholds);
	}

	private async checkBattery(
		batteryVoltage: number,
		userPlantId: number | undefined,
		userId: number | undefined,
		plantNickname: string | null,
	): Promise<void> {
		const BATTERY_LOW_PCT = 10;
		const pct = this.batteryPercentage(batteryVoltage);

		if (pct < BATTERY_LOW_PCT && userPlantId != null && userId != null) {
			const openIssues = await this.repository.findOpenIssuesByUserPlant(userPlantId);
			const existing = openIssues.find((i) => i.issue_type === "BATTERY_LOW");

			if (existing) {
				await this.repository.incrementIssueOccurrence(existing.id);
			} else {
				const issue = await this.repository.createIssue(userPlantId, "BATTERY_LOW");
				await this.dispatchNotificationForIssue(issue, userId, userPlantId, plantNickname);
			}

			console.log(`[Telemetry] BATTERY_LOW — voltage=${batteryVoltage}, pct=${pct}% (instant trigger)`);
		} else if (pct < BATTERY_LOW_PCT) {
			console.warn(`[Telemetry] BATTERY_LOW — probe battery at ${pct}% but no plant linked. Skipping issue creation.`);
		} else if (userPlantId != null) {
			const openIssues = await this.repository.findOpenIssuesByUserPlant(userPlantId);
			const batteryIssue = openIssues.find((i) => i.issue_type === "BATTERY_LOW");
			if (batteryIssue) {
				console.log(`[Telemetry] Auto-resolving BATTERY_LOW (issue #${batteryIssue.id}) — battery recovered to ${pct}%`);
				await this.repository.resolveIssue(batteryIssue.id);
			}
		}
	}

	async checkStaleProbes(): Promise<void> {
		const STALE_THRESHOLD_MINUTES = 180;
		const BATTERY_LOW_VOLTAGE = 3.12;

		const stale = await this.probeRepository.findStaleProbes(STALE_THRESHOLD_MINUTES);

		for (const { probe, userPlant } of stale) {
			if (probe.battery_voltage < BATTERY_LOW_VOLTAGE) {
				console.log(`[Telemetry] Skipping PROBE_STALE for ${probe.hardware_id} — battery is critically low (${probe.battery_voltage}V), BATTERY_LOW already handles this`);
				continue;
			}

			const openIssues = await this.repository.findOpenIssuesByUserPlant(userPlant.id);
			const existing = openIssues.find((i) => i.issue_type === "PROBE_STALE");

			if (existing) {
				await this.repository.incrementIssueOccurrence(existing.id);
			} else {
				const issue = await this.repository.createIssue(userPlant.id, "PROBE_STALE");
				await this.dispatchNotificationForIssue(issue, userPlant.user_id, userPlant.id, userPlant.nickname);
			}

			await this.probeRepository.updateState(probe.id, "offline");

			console.log(`[Telemetry] PROBE_STALE — ${probe.hardware_id} last seen > ${STALE_THRESHOLD_MINUTES} min ago (battery ${probe.battery_voltage}V)`);
		}
	}

	async checkDailyLightIntegral(): Promise<void> {
		const END_OF_DAY_HOUR = 22;

		const summaries = await this.repository.getDailyLightSummary();

		for (const s of summaries) {
			if (s.cumulativeHours >= s.requiredHours) {
				const openIssues = await this.repository.findOpenIssuesByUserPlant(s.userPlantId);
				const existing = openIssues.find((i) => i.issue_type === "LIGHT_TOO_LOW");
				if (existing) {
					console.log(`[Telemetry] Auto-resolving LIGHT_TOO_LOW (issue #${existing.id}) — daily sun hours met: ${s.cumulativeHours.toFixed(1)}h >= ${s.requiredHours}h`);
					await this.repository.resolveIssue(existing.id);
				}
			} else if (new Date().getHours() >= END_OF_DAY_HOUR) {
				const openIssues = await this.repository.findOpenIssuesByUserPlant(s.userPlantId);
				const existing = openIssues.find((i) => i.issue_type === "LIGHT_TOO_LOW");

				if (existing) {
					await this.repository.incrementIssueOccurrence(existing.id);
				} else {
					const issue = await this.repository.createIssue(s.userPlantId, "LIGHT_TOO_LOW");
					await this.dispatchNotificationForIssue(issue, s.userId, s.userPlantId, s.nickname);
				}

				console.log(`[Telemetry] LIGHT_TOO_LOW — daily sun hours: ${s.cumulativeHours.toFixed(1)}h < ${s.requiredHours}h (end-of-day trigger)`);
			}
		}
	}

	private async checkAndActOnMetric(
		metric: string,
		latestValue: number,
		bounds: { min: number; max: number },
		severity: "instant" | "persistent",
		allSamples: MeasurementSample[],
		userPlantId: number,
		issueTypes: [string, string],
		userId: number,
		plantNickname: string | null,
	): Promise<void> {
		let triggeredType: string | null = null;

		if (latestValue < bounds.min) {
			triggeredType = issueTypes[0];
		} else if (latestValue > bounds.max) {
			triggeredType = issueTypes[1];
		}

		if (!triggeredType) return;

		if (severity === "instant") {
			console.log(`[Telemetry] ${triggeredType} — value=${latestValue}, limit=${triggeredType === issueTypes[0] ? bounds.min : bounds.max} (instant trigger)`);
		} else {
			const required = 3;
			let consecutive = 0;

			for (let i = allSamples.length - 1; i >= 0; i--) {
				const val = this.getMetricValue(allSamples[i]!, metric);
				const outOfRange = val < bounds.min || val > bounds.max;
				if (outOfRange) {
					consecutive++;
					if (consecutive >= required) break;
				} else {
					break;
				}
			}

			if (consecutive < required) {
				console.log(`[Telemetry] ${triggeredType} filtered by anti-spam — only ${consecutive} consecutive out-of-range readings (need ${required})`);
				return;
			}

			console.log(`[Telemetry] ${triggeredType} — value=${latestValue}, limit=${triggeredType === issueTypes[0] ? bounds.min : bounds.max} (persistent trigger, ${consecutive} consecutive)`);
		}

		const { issue, isNew } = await this.upsertIssue(userPlantId, triggeredType);

		if (isNew) {
			await this.dispatchNotificationForIssue(issue, userId, userPlantId, plantNickname);
		}
	}

	private async upsertIssue(userPlantId: number, issueType: string): Promise<{ issue: ActiveIssueRecord; isNew: boolean }> {
		const openIssues = await this.repository.findOpenIssuesByUserPlant(userPlantId);
		const existing = openIssues.find((i) => i.issue_type === issueType);

		if (existing) {
			await this.repository.incrementIssueOccurrence(existing.id);
			return { issue: existing, isNew: false };
		}

		const issue = await this.repository.createIssue(userPlantId, issueType);
		return { issue, isNew: true };
	}

	private async dispatchNotificationForIssue(
		issue: ActiveIssueRecord,
		userId: number,
		userPlantId: number,
		plantNickname: string | null,
	): Promise<void> {
		const { title, message } = this.getNotificationContent(issue.issue_type, plantNickname);

		const window = await this.repository.findUserNotificationWindow(userId);
		const now = new Date();

		if (window && this.isWithinWindow(now, window.notification_window_start, window.notification_window_end)) {
			await this.repository.createNotification({
				userId,
				userPlantId,
				issueId: issue.id,
				title,
				message,
				notificationType: "sensor_alert",
				state: "sent",
			});

			await this.pushNotificationService.send(userId, title, message);
		} else if (window) {
			const snoozedUntil = this.computeNextWindowStart(window.notification_window_start);

			await this.repository.createNotification({
				userId,
				userPlantId,
				issueId: issue.id,
				title,
				message,
				notificationType: "sensor_alert",
				state: "snoozed",
				snoozedUntil,
			});

			console.log(`[Telemetry] Notification snoozed until ${snoozedUntil.toISOString()} (outside quiet hours)`);
		} else {
			await this.repository.createNotification({
				userId,
				userPlantId,
				issueId: issue.id,
				title,
				message,
				notificationType: "sensor_alert",
				state: "sent",
			});

			await this.pushNotificationService.send(userId, title, message);
		}
	}

	private getNotificationContent(issueType: string, plantNickname: string | null): { title: string; message: string } {
		const name = plantNickname ?? "je plant";

		switch (issueType) {
			case "SOIL_TOO_DRY": return { title: "Grond te droog", message: `${name} heeft water nodig!` };
			case "SOIL_TOO_WET": return { title: "Grond te nat", message: `De grond van ${name} is te nat.` };
			case "TEMP_TOO_LOW": return { title: "Temperatuur te laag", message: `Het is te koud voor ${name}.` };
			case "TEMP_TOO_HIGH": return { title: "Temperatuur te hoog", message: `Het is te warm voor ${name}.` };
			case "LIGHT_TOO_LOW": return { title: "Te weinig licht", message: `${name} krijgt te weinig licht.` };
			case "LIGHT_TOO_HIGH": return { title: "Te veel licht", message: `${name} staat te fel.` };
			case "BATTERY_LOW": return { title: "Batterij bijna leeg", message: `De batterij van de sonde bij ${name} is bijna leeg.` };
			case "PROBE_STALE": return { title: "Sonde reageert niet", message: `De sonde bij ${name} stuurt al meer dan 3 uur geen data.` };
			default: return { title: "Sensor alert", message: `Er is een probleem met ${name}.` };
		}
	}

	private isWithinWindow(now: Date, windowStart: string, windowEnd: string): boolean {
		const currentMinutes = now.getHours() * 60 + now.getMinutes();
		const [startH, startM] = windowStart.split(":").map(Number) as [number, number];
		const [endH, endM] = windowEnd.split(":").map(Number) as [number, number];
		const startMinutes = startH * 60 + startM;
		const endMinutes = endH * 60 + endM;

		return currentMinutes >= startMinutes && currentMinutes < endMinutes;
	}

	private computeNextWindowStart(windowStart: string): Date {
		const now = new Date();
		const [hours, minutes] = windowStart.split(":").map(Number) as [number, number];
		const next = new Date(now);
		next.setHours(hours, minutes, 0, 0);

		if (next <= now) {
			next.setDate(next.getDate() + 1);
		}

		return next;
	}

	private async autoResolveIssues(
		allSamples: MeasurementSample[],
		userPlantId: number,
		thresholds: StageThresholdsRecord,
	): Promise<void> {
		const openIssues = await this.repository.findOpenIssuesByUserPlant(userPlantId);
		if (openIssues.length === 0) return;

		const latest = allSamples[allSamples.length - 1]!;

		for (const issue of openIssues) {
			let resolved = false;

			switch (issue.issue_type) {
				case "SOIL_TOO_DRY":
					if (latest.soil_moist_pct >= thresholds.soil_min) resolved = true;
					break;
				case "SOIL_TOO_WET":
					if (latest.soil_moist_pct <= thresholds.soil_max) resolved = true;
					break;
				case "TEMP_TOO_LOW":
					if (latest.temp_c >= thresholds.temp_min) resolved = true;
					break;
				case "TEMP_TOO_HIGH":
					if (latest.temp_c <= thresholds.temp_max) resolved = true;
					break;
				case "LIGHT_TOO_HIGH":
					if (latest.light_lux <= thresholds.light_max) resolved = true;
					break;
			}

			if (resolved) {
				console.log(`[Telemetry] Auto-resolving ${issue.issue_type} (issue #${issue.id}) — latest reading is back in range`);
				await this.repository.resolveIssue(issue.id);
			}
		}
	}

	private getMetricValue(sample: MeasurementSample, metric: string): number {
		switch (metric) {
			case "soil_moisture": return sample.soil_moist_pct;
			case "temperature": return sample.temp_c;
			case "light": return sample.light_lux;
			default: throw new Error(`Unknown metric: ${metric}`);
		}
	}

	async getRecentTelemetry(sondeId: string, limit: number = 24): Promise<ProbeEntryRecord[]> {
		return this.repository.getRecentEntriesBySondeId(sondeId, limit);
	}

	async getRecentTelemetryByUserPlant(userPlantId: number, limit: number = 24): Promise<ProbeEntryRecord[]> {
		return this.repository.getRecentEntriesByUserPlantId(userPlantId, limit);
	}

	mapSoilMoisture(rawValue: number): number {
		const DRY_THRESHOLD = 400;
		const WET_THRESHOLD = 200;

		if (rawValue <= WET_THRESHOLD) return 100;
		if (rawValue >= DRY_THRESHOLD) return 0;

		const percentage = ((rawValue - WET_THRESHOLD) / (DRY_THRESHOLD - WET_THRESHOLD)) * 100;
		return Math.round((100 - percentage) * 100) / 100;
	}
}
