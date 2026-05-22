import { TelemetryService } from "./telemetry.service";

const CHECK_INTERVAL_MS = 60 * 60 * 1000; // 60 min

let intervalHandle: ReturnType<typeof setInterval> | null = null;

export function startScheduler(): void {
	if (intervalHandle) return;

	const telemetryService = new TelemetryService();

	console.log(`[Scheduler] Starting checks every ${CHECK_INTERVAL_MS / 60000} minutes`);

	telemetryService.checkStaleProbes();
	telemetryService.checkDailyLightIntegral();
	telemetryService.checkDailyTemperatureIntegral();

	intervalHandle = setInterval(() => {
		telemetryService.checkStaleProbes();
		telemetryService.checkDailyLightIntegral();
		telemetryService.checkDailyTemperatureIntegral();
	}, CHECK_INTERVAL_MS);
}

export function stopScheduler(): void {
	if (intervalHandle) {
		clearInterval(intervalHandle);
		intervalHandle = null;
		console.log("[Scheduler] Stopped");
	}
}
