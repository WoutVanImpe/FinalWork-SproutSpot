import { TelemetryService } from "./telemetry.service";
import { CHECK_INTERVAL_MS } from "../config";

let intervalHandle: ReturnType<typeof setInterval> | null = null;

async function safeRun(fn: () => Promise<void>, name: string): Promise<void> {
	try {
		await fn();
	} catch (err) {
		console.error(`[Scheduler] ${name} failed:`, err);
	}
}

export function startScheduler(): void {
	if (intervalHandle) return;

	const telemetryService = new TelemetryService();

	console.log(`[Scheduler] Starting checks every ${CHECK_INTERVAL_MS / 60000} minutes`);

	safeRun(() => telemetryService.checkStaleProbes(), "checkStaleProbes");
	safeRun(() => telemetryService.checkDailyLightIntegral(), "checkDailyLightIntegral");
	safeRun(() => telemetryService.checkDailyTemperatureIntegral(), "checkDailyTemperatureIntegral");
	safeRun(() => telemetryService.processSnoozedNotifications(), "processSnoozedNotifications");
	safeRun(() => telemetryService.processSentNotifications(), "processSentNotifications");
	safeRun(() => telemetryService.checkStageAdvancement(), "checkStageAdvancement");

	intervalHandle = setInterval(() => {
		safeRun(() => telemetryService.checkStaleProbes(), "checkStaleProbes");
		safeRun(() => telemetryService.checkDailyLightIntegral(), "checkDailyLightIntegral");
		safeRun(() => telemetryService.checkDailyTemperatureIntegral(), "checkDailyTemperatureIntegral");
		safeRun(() => telemetryService.processSnoozedNotifications(), "processSnoozedNotifications");
		safeRun(() => telemetryService.processSentNotifications(), "processSentNotifications");
		safeRun(() => telemetryService.checkStageAdvancement(), "checkStageAdvancement");
	}, CHECK_INTERVAL_MS);
}

export function stopScheduler(): void {
	if (intervalHandle) {
		clearInterval(intervalHandle);
		intervalHandle = null;
		console.log("[Scheduler] Stopped");
	}
}
