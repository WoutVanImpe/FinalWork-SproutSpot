import { TelemetryService } from "./telemetry.service";
import { CHECK_INTERVAL_MS } from "../config";

let intervalHandle: ReturnType<typeof setInterval> | null = null;

export function startScheduler(): void {
	if (intervalHandle) return;

	const telemetryService = new TelemetryService();

	console.log(`[Scheduler] Starting checks every ${CHECK_INTERVAL_MS / 60000} minutes`);

	telemetryService.checkStaleProbes();
	telemetryService.checkDailyLightIntegral();
	telemetryService.checkDailyTemperatureIntegral();
	telemetryService.processSnoozedNotifications();
	telemetryService.processSentNotifications();
	telemetryService.checkStageAdvancement();

	intervalHandle = setInterval(() => {
		telemetryService.checkStaleProbes();
		telemetryService.checkDailyLightIntegral();
		telemetryService.checkDailyTemperatureIntegral();
		telemetryService.processSnoozedNotifications();
		telemetryService.processSentNotifications();
		telemetryService.checkStageAdvancement();
	}, CHECK_INTERVAL_MS);
}

export function stopScheduler(): void {
	if (intervalHandle) {
		clearInterval(intervalHandle);
		intervalHandle = null;
		console.log("[Scheduler] Stopped");
	}
}
