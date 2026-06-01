export function batteryPercentage(voltage: number): number {
	const MIN_VOLTAGE = 3.3;
	const MAX_VOLTAGE = 4.2;
	const pct = Math.round(((voltage - MIN_VOLTAGE) / (MAX_VOLTAGE - MIN_VOLTAGE)) * 100);
	return Math.max(0, Math.min(100, pct));
}
