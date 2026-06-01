export interface VegetableInfo {
	id: string;
	name: string;
	image: number | { uri: string };
	warning?: boolean;
	placement: "inside" | "outside" | "both";
	sunlight: string;
	sowingPeriod: { startMonth: number; endMonth: number };
	careLevel: string;
}

export function formatSowingPeriod(startMonth: number, endMonth: number): string {
	const months = [
		"januari", "februari", "maart", "april", "mei", "juni",
		"juli", "augustus", "september", "oktober", "november", "december",
	];
	return `${months[startMonth - 1]} - ${months[endMonth - 1]}`;
}

export function formatTemperature(min: number, max: number): string {
	return `${min}°C - ${max}°C`;
}
