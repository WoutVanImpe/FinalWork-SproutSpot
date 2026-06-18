import { TelemetryRepository } from "../repositories/telemetry.repository";
import { NotificationRepository } from "../repositories/notification.repository";
import { ProbeRepository, StaleProbeResult } from "../repositories/probe.repository";
import { UserPlantRepository } from "../repositories/userPlant.repository";
import { batteryPercentage } from "../utils/battery";
import { PushNotificationService } from "./push-notification.service";
import { TelemetryBatchUploadDto, TelemetryEntryDto } from "../types/dto";
import { ActiveIssueRecord, ProbeEntryRecord, StageThresholdsRecord, UserPlantRecord } from "../types/database";
import { STALE_THRESHOLD_MINUTES, IS_DEV } from "../config";

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
	private notificationRepository: NotificationRepository;
	private probeRepository: ProbeRepository;
	private userPlantRepository: UserPlantRepository;
	private pushNotificationService: PushNotificationService;

	constructor() {
		this.repository = new TelemetryRepository();
		this.notificationRepository = new NotificationRepository();
		this.probeRepository = new ProbeRepository();
		this.userPlantRepository = new UserPlantRepository();
		this.pushNotificationService = new PushNotificationService();
	}

	/**
	 * @description Handle a charging-only payload from a probe. Updates battery/wifi/last_seen and sets is_charging=true. No plant entries are created.
	 * @param {string} hardwareId - The probe's hardware identifier.
	 * @param {{ battery_voltage?: number; wifi_rssi?: number }} body - The charging payload body.
	 * @returns {Promise<void>}
	 */
	async handleChargingUpdate(hardwareId: string, body: { battery_voltage?: number; wifi_rssi?: number }): Promise<void> {
		const batteryVoltage = body.battery_voltage ?? 0;
		const wifiRssi = body.wifi_rssi ?? 0;

		const probe = await this.probeRepository.findByHardwareId(hardwareId);
		if (!probe) {
			console.warn(`[Telemetry] Charging update for unknown probe ${hardwareId} — ignoring`);
			return;
		}

		await this.probeRepository.syncHealth(hardwareId, batteryVoltage, wifiRssi, true);

		if (probe.state === "offline") {
			await this.probeRepository.resolveBackOnline(probe.id, hardwareId);
		}

		console.log(`[Telemetry] Charging update for ${hardwareId}: battery=${batteryVoltage}V, rssi=${wifiRssi}`);
	}

	async uploadTelemetry(payload: TelemetryBatchUploadDto): Promise<ProbeEntryRecord[]> {
		const { hardware_id, entries } = payload;

		if (!entries || entries.length === 0) {
			throw new Error("entries must be a non-empty array");
		}

		const probe = await this.probeRepository.findByHardwareId(hardware_id);
		if (!probe) {
			throw new Error("Probe not registered");
		}

		if (probe.is_charging) {
			await this.probeRepository.updateCharging(hardware_id, false);
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
		linked: { userPlant: UserPlantRecord; thresholds: StageThresholdsRecord; plantingType: string },
		hardwareId: string,
	): Promise<void> {
		const { thresholds, plantingType } = linked;
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

		if (plantingType !== "outdoor" && latest.temp_c > thresholds.temp_max) {
			const required = 3;
			let consecutive = 0;

			for (let i = allSamples.length - 1; i >= 0; i--) {
				const val = allSamples[i]!.temp_c;
				if (val > thresholds.temp_max) {
					consecutive++;
					if (consecutive >= required) break;
				} else {
					break;
				}
			}

			if (consecutive >= required) {
				console.log(`[Telemetry] TEMP_TOO_HIGH — value=${latest.temp_c}, limit=${thresholds.temp_max} (persistent trigger, ${consecutive} consecutive)`);
				const { issue, isNew } = await this.upsertIssue(userPlantId, "TEMP_TOO_HIGH");
				if (isNew) {
					await this.dispatchNotificationForIssue(issue, userId, userPlantId, plantNickname);
				}
			} else {
				console.log(`[Telemetry] TEMP_TOO_HIGH filtered by anti-spam — only ${consecutive} consecutive out-of-range readings (need ${required})`);
			}
		}

		const frostReading = batchEntries.find((e) => e.temp_c < 2);
		if (frostReading) {
			console.log(`[Telemetry] TEMP_TOO_LOW (FROST) — value=${frostReading.temp_c}°C < 2°C (critical instant trigger)`);
			const { issue, isNew } = await this.upsertIssue(userPlantId, "TEMP_TOO_LOW");
			if (isNew) {
				await this.dispatchNotificationForIssue(issue, userId, userPlantId, plantNickname);
			}
		}

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

		await this.autoResolveIssues(allSamples, userPlantId, thresholds);
	}

	private async checkBattery(
		batteryVoltage: number,
		userPlantId: number | undefined,
		userId: number | undefined,
		plantNickname: string | null,
	): Promise<void> {
		const BATTERY_WARNING_VOLTAGE = 3.5;
		const BATTERY_LOW_PCT = 10;
		const pct = batteryPercentage(batteryVoltage);

		if (userPlantId == null || userId == null) {
			if (pct < BATTERY_LOW_PCT) {
				console.warn(`[Telemetry] BATTERY_LOW — probe battery at ${pct}% but no plant linked. Skipping issue creation.`);
			}
			return;
		}

		const openIssues = await this.repository.findOpenIssuesByUserPlant(userPlantId);

		if (pct < BATTERY_LOW_PCT) {
			const existing = openIssues.find((i) => i.issue_type === "BATTERY_LOW");
			if (existing) {
				await this.repository.incrementIssueOccurrence(existing.id);
			} else {
				const issue = await this.repository.createIssue(userPlantId, "BATTERY_LOW");
				await this.dispatchNotificationForIssue(issue, userId, userPlantId, plantNickname);
			}
			console.log(`[Telemetry] BATTERY_LOW — voltage=${batteryVoltage}, pct=${pct}% (instant trigger)`);
		} else {
			const batteryIssue = openIssues.find((i) => i.issue_type === "BATTERY_LOW");
			if (batteryIssue) {
				console.log(`[Telemetry] Auto-resolving BATTERY_LOW (issue #${batteryIssue.id}) — battery recovered to ${pct}%`);
				await this.repository.resolveIssue(batteryIssue.id);
			}

			if (batteryVoltage <= BATTERY_WARNING_VOLTAGE && batteryVoltage > 3.3) {
				const existing = openIssues.find((i) => i.issue_type === "BATTERY_WARNING");
				if (!existing) {
					const issue = await this.repository.createIssue(userPlantId, "BATTERY_WARNING");
					await this.dispatchNotificationForIssue(issue, userId, userPlantId, plantNickname);
					console.log(`[Telemetry] BATTERY_WARNING — voltage=${batteryVoltage}, pct=${pct}%`);
				}
			} else if (batteryVoltage > BATTERY_WARNING_VOLTAGE) {
				const warningIssue = openIssues.find((i) => i.issue_type === "BATTERY_WARNING");
				if (warningIssue) {
					console.log(`[Telemetry] Auto-resolving BATTERY_WARNING (issue #${warningIssue.id}) — voltage recovered to ${batteryVoltage}V`);
					await this.repository.resolveIssue(warningIssue.id);
				}
			}
		}

	}

	async checkStaleProbes(): Promise<void> {
		const BATTERY_LOW_VOLTAGE = 3.39;

		const stale = await this.probeRepository.findStaleProbes(STALE_THRESHOLD_MINUTES);

		for (const { probe, userPlant } of stale) {
			if (probe.battery_voltage < BATTERY_LOW_VOLTAGE) {
				console.log(`[Telemetry] Skipping PROBE_STALE for ${probe.hardware_id} — battery is critically low (${probe.battery_voltage}V), BATTERY_LOW already handles this`);
				continue;
			}

			const hoursSinceLastSeen = Math.round((Date.now() - new Date(probe.last_seen).getTime()) / (1000 * 60 * 60));

			const openIssues = await this.repository.findOpenIssuesByUserPlant(userPlant.id);
			const existing = openIssues.find((i) => i.issue_type === "PROBE_STALE");

			if (existing) {
				await this.repository.incrementIssueOccurrence(existing.id);
			} else {
				const issue = await this.repository.createIssue(userPlant.id, "PROBE_STALE");
				await this.dispatchNotificationForIssue(issue, userPlant.user_id, userPlant.id, userPlant.nickname, hoursSinceLastSeen);
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
					const today = new Date().toISOString().slice(0, 10);
					const lastSeen = existing.last_seen.toISOString().slice(0, 10);
					if (lastSeen !== today) {
						await this.repository.incrementIssueOccurrence(existing.id);
					}
				} else {
					const issue = await this.repository.createIssue(s.userPlantId, "LIGHT_TOO_LOW");
					await this.dispatchNotificationForIssue(issue, s.userId, s.userPlantId, s.nickname);
				}

				console.log(`[Telemetry] LIGHT_TOO_LOW — daily sun hours: ${s.cumulativeHours.toFixed(1)}h < ${s.requiredHours}h (end-of-day trigger)`);
			}
		}
	}

	async checkDailyTemperatureIntegral(): Promise<void> {
		const END_OF_DAY_HOUR = 22;

		const summaries = await this.repository.getDailyTemperatureSummary();

		for (const s of summaries) {
			if (s.plantingType === "outdoor") continue;

			if (s.dailyAvgTemp >= s.tempMin) {
				const openIssues = await this.repository.findOpenIssuesByUserPlant(s.userPlantId);
				const existing = openIssues.find((i) => i.issue_type === "TEMP_TOO_LOW");
				if (existing) {
					console.log(`[Telemetry] Auto-resolving TEMP_TOO_LOW (issue #${existing.id}) — daily avg ${s.dailyAvgTemp.toFixed(1)}°C >= ${s.tempMin}°C`);
					await this.repository.resolveIssue(existing.id);
				}
			} else if (new Date().getHours() >= END_OF_DAY_HOUR) {
				const openIssues = await this.repository.findOpenIssuesByUserPlant(s.userPlantId);
				const existing = openIssues.find((i) => i.issue_type === "TEMP_TOO_LOW");

				if (existing) {
					const today = new Date().toISOString().slice(0, 10);
					const lastSeen = existing.last_seen.toISOString().slice(0, 10);
					if (lastSeen !== today) {
						await this.repository.incrementIssueOccurrence(existing.id);
					}
				} else {
					const issue = await this.repository.createIssue(s.userPlantId, "TEMP_TOO_LOW");
					await this.dispatchNotificationForIssue(issue, s.userId, s.userPlantId, s.nickname);
				}

				console.log(`[Telemetry] TEMP_TOO_LOW — daily avg ${s.dailyAvgTemp.toFixed(1)}°C < ${s.tempMin}°C (end-of-day trigger)`);
			}
		}
	}

	async processSnoozedNotifications(): Promise<void> {
		const due = await this.notificationRepository.getDueSnoozedNotifications();

		for (const n of due) {
			try {
				if (n.issue_id) {
					const issue = await this.notificationRepository.findIssueById(n.issue_id);
					if (issue && issue.resolved_at) {
						await this.notificationRepository.acknowledgeNotification(n.id);
						console.log(`[Telemetry] Auto-acknowledged snoozed notification ${n.id} — linked issue ${n.issue_id} already resolved`);
						continue;
					}

					if (issue && issue.issue_type === "PROBE_STALE" && n.user_plant_id) {
						const lastSeen = await this.probeRepository.findLastSeenByUserPlantId(n.user_plant_id);
						if (lastSeen) {
							const hours = Math.round((Date.now() - new Date(lastSeen).getTime()) / (1000 * 60 * 60));
							const { title, message } = this.getNotificationContent("PROBE_STALE", null, hours);
							n.title = title;
							n.message = message;
						}
					}
				}

				const now = new Date();

				if (n.notification_window_start && this.isWithinWindow(now, n.notification_window_start, n.notification_window_end)) {
					await this.notificationRepository.activateSnoozedNotification(n.id);
					await this.pushNotificationService.send(n.user_id, n.title, n.message);
					console.log(`[Telemetry] Delivered snoozed notification ${n.id} to user ${n.user_id}`);
				} else if (n.notification_window_start) {
					const snoozedUntil = this.computeNextWindowStart(n.notification_window_start);
					await this.notificationRepository.rescheduleSnoozedNotification(n.id, snoozedUntil);
					console.log(`[Telemetry] Rescheduled snoozed notification ${n.id} to ${snoozedUntil.toISOString()}`);
				} else {
					await this.notificationRepository.activateSnoozedNotification(n.id);
					await this.pushNotificationService.send(n.user_id, n.title, n.message);
					console.log(`[Telemetry] Delivered snoozed notification ${n.id} (no window set)`);
				}
			} catch (err) {
				console.error(`[Telemetry] Error processing snoozed notification ${n.id}:`, err);
			}
		}
	}

	async processSentNotifications(): Promise<void> {
		const pending = await this.notificationRepository.getPendingReminderNotifications();

		for (const n of pending) {
			try {
				const now = new Date();

				if (n.notification_window_start && !this.isWithinWindow(now, n.notification_window_start, n.notification_window_end)) {
					continue;
				}

				await this.pushNotificationService.send(n.user_id, n.title, n.message);
				await this.notificationRepository.updateRemindedAt(n.id);
				console.log(`[Telemetry] Reminded user ${n.user_id} about notification ${n.id}`);
			} catch (err) {
				console.error(`[Telemetry] Error processing sent notification reminder ${n.id}:`, err);
			}
		}
	}

	async checkStageAdvancement(): Promise<void> {
		try {
			const readyPlants = await this.userPlantRepository.findPlantsReadyForStageAdvancement();

			for (const plant of readyPlants) {
				try {
					const window = await this.repository.findUserNotificationWindow(plant.user_id);
					const now = new Date();
					const title = "Tijd voor een nieuwe fase!";
					const message = `${plant.plant_name} is klaar om naar de volgende fase te gaan. Controleer of de plant de kenmerken vertoont.`;

					if (window && this.isWithinWindow(now, window.notification_window_start, window.notification_window_end)) {
						await this.repository.createNotification({
							userId: plant.user_id,
							userPlantId: plant.user_plant_id,
							issueId: null,
							title,
							message,
							notificationType: "stage_validation",
							state: "sent",
						});

						if (!IS_DEV) {
							await this.pushNotificationService.send(plant.user_id, title, message);
						}

						console.log(`[Telemetry] Stage validation notification created for plant ${plant.user_plant_id} (user ${plant.user_id})`);
					} else if (window) {
						const snoozedUntil = this.computeNextWindowStart(window.notification_window_start);

						await this.repository.createNotification({
							userId: plant.user_id,
							userPlantId: plant.user_plant_id,
							issueId: null,
							title,
							message,
							notificationType: "stage_validation",
							state: "snoozed",
							snoozedUntil,
						});

						console.log(`[Telemetry] Stage validation notification snoozed until ${snoozedUntil.toISOString()} (outside quiet hours) for plant ${plant.user_plant_id}`);
					} else {
						await this.repository.createNotification({
							userId: plant.user_id,
							userPlantId: plant.user_plant_id,
							issueId: null,
							title,
							message,
							notificationType: "stage_validation",
							state: "sent",
						});

						if (!IS_DEV) {
							await this.pushNotificationService.send(plant.user_id, title, message);
						}

						console.log(`[Telemetry] Stage validation notification created for plant ${plant.user_plant_id} (no window set)`);
					}
				} catch (err) {
					console.error(`[Telemetry] Error creating stage validation for plant ${plant.user_plant_id}:`, err);
				}
			}
		} catch (err) {
			console.error("[Telemetry] Error checking stage advancement:", err);
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
		elapsedHours?: number,
	): Promise<void> {
		const { title, message } = this.getNotificationContent(issue.issue_type, plantNickname, elapsedHours);

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

	private getNotificationContent(issueType: string, plantNickname: string | null, elapsedHours?: number): { title: string; message: string } {
		const name = plantNickname ?? "je plant";

		switch (issueType) {
			case "SOIL_TOO_DRY": return { title: "Grond te droog", message: `${name} heeft water nodig!` };
			case "SOIL_TOO_WET": return { title: "Grond te nat", message: `De grond van ${name} is te nat.` };
			case "TEMP_TOO_LOW": return { title: "Temperatuur te laag", message: `Het is te koud voor ${name}.` };
			case "TEMP_TOO_HIGH": return { title: "Temperatuur te hoog", message: `Het is te warm voor ${name}.` };
			case "LIGHT_TOO_LOW": return { title: "Te weinig licht", message: `${name} krijgt te weinig licht.` };
			case "LIGHT_TOO_HIGH": return { title: "Te veel licht", message: `${name} staat te fel.` };
			case "BATTERY_WARNING": return { title: "Batterij bijna leeg", message: `Laad de batterij van de sonde bij ${name} op.` };
			case "BATTERY_LOW": return { title: "Batterij kritiek", message: `De batterij van de sonde bij ${name} is bijna leeg. Laad onmiddellijk op.` };
			case "PROBE_STALE": {
				const hours = elapsedHours ?? 3;
				const duration = hours >= 24
					? `${Math.floor(hours / 24)}d ${hours % 24}u`
					: `${hours} uur`;
				return { title: "Sonde reageert niet", message: `De sonde bij ${name} stuurt al ${duration} geen data.` };
			}
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
		const DRY_THRESHOLD = 2765;
		const WET_THRESHOLD = 1880;

		if (rawValue <= WET_THRESHOLD) return 100;
		if (rawValue >= DRY_THRESHOLD) return 0;

		const percentage = ((rawValue - WET_THRESHOLD) / (DRY_THRESHOLD - WET_THRESHOLD)) * 100;
		return Math.round((100 - percentage) * 100) / 100;
	}
}
