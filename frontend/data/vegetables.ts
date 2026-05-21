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

export interface VegetableDetail {
	name: string;
	image: number | { uri: string };
	light: string;
	water: string;
	difficulty: string;
	temperature: { min: number; max: number };
	sowingPeriod: { startMonth: number; endMonth: number };
	sowingDepth: string;
	sowingDistance: string;
	potDepth: string;
	stages: { label: string; durationDays: number }[];
	totalDays: number;
	placement: "inside" | "outside" | "both";
	sunlight: string;
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

const IMG = (name: string): number => ({ uri: `https://via.placeholder.com/150?text=${name}` }) as unknown as number;

const VEGETABLE_LIST: VegetableInfo[] = [
	{ id: "veg_tomato", name: "Tomaat", image: IMG("Tomaat"), placement: "both", sunlight: "full", sowingPeriod: { startMonth: 3, endMonth: 5 }, careLevel: "daily" },
	{ id: "veg_cabbage", name: "Kool", image: IMG("Kool"), placement: "outside", sunlight: "full", sowingPeriod: { startMonth: 4, endMonth: 6 }, careLevel: "weekly" },
	{ id: "veg_basil", name: "Basilicum", image: IMG("Basilicum"), placement: "inside", sunlight: "full", sowingPeriod: { startMonth: 3, endMonth: 7 }, careLevel: "daily" },
	{ id: "veg_lettuce", name: "Sla", image: IMG("Sla"), placement: "outside", sunlight: "partial", sowingPeriod: { startMonth: 3, endMonth: 8 }, careLevel: "weekly" },
	{ id: "veg_strawberry", name: "Aardbei", image: IMG("Aardbei"), placement: "both", sunlight: "partial", sowingPeriod: { startMonth: 2, endMonth: 5 }, careLevel: "weekly" },
	{ id: "veg_carrot", name: "Wortel", image: IMG("Wortel"), placement: "outside", sunlight: "full", sowingPeriod: { startMonth: 3, endMonth: 7 }, careLevel: "weekly" },
	{ id: "veg_mint", name: "Munt", image: IMG("Munt"), placement: "both", sunlight: "partial", sowingPeriod: { startMonth: 3, endMonth: 6 }, careLevel: "minimal" },
	{ id: "veg_spinach", name: "Spinazie", image: IMG("Spinazie"), placement: "outside", sunlight: "partial", sowingPeriod: { startMonth: 2, endMonth: 4 }, careLevel: "weekly" },
];

const VEGETABLE_DETAILS_RECORD: Record<string, VegetableDetail> = {
	veg_tomato: {
		name: "Tomaat",
		image: IMG("Tomaat"),
		light: "Volle zon",
		water: "Regelmatig water geven",
		difficulty: "Gemiddeld",
		temperature: { min: 18, max: 28 },
		sowingPeriod: { startMonth: 3, endMonth: 5 },
		sowingDepth: "0.5 cm",
		sowingDistance: "50 cm",
		potDepth: "25 cm",
		stages: [
			{ label: "Zaaien", durationDays: 7 },
			{ label: "Kiem", durationDays: 10 },
			{ label: "Blad", durationDays: 20 },
			{ label: "Groeispurt", durationDays: 30 },
			{ label: "Bloeien", durationDays: 15 },
			{ label: "Oogsten", durationDays: 20 },
		],
		totalDays: 102,
		placement: "both",
		sunlight: "full",
		careLevel: "daily",
	},
	veg_cabbage: {
		name: "Kool",
		image: IMG("Kool"),
		light: "Volle zon",
		water: "Regelmatig water geven",
		difficulty: "Gemakkelijk",
		temperature: { min: 10, max: 20 },
		sowingPeriod: { startMonth: 4, endMonth: 6 },
		sowingDepth: "1 cm",
		sowingDistance: "60 cm",
		potDepth: "30 cm",
		stages: [
			{ label: "Zaaien", durationDays: 7 },
			{ label: "Kiem", durationDays: 10 },
			{ label: "Blad", durationDays: 25 },
			{ label: "Groeispurt", durationDays: 40 },
			{ label: "Oogsten", durationDays: 20 },
		],
		totalDays: 102,
		placement: "outside",
		sunlight: "full",
		careLevel: "weekly",
	},
	veg_basil: {
		name: "Basilicum",
		image: IMG("Basilicum"),
		light: "Volle zon",
		water: "Regelmatig water geven",
		difficulty: "Gemakkelijk",
		temperature: { min: 18, max: 28 },
		sowingPeriod: { startMonth: 3, endMonth: 7 },
		sowingDepth: "0.5 cm",
		sowingDistance: "20 cm",
		potDepth: "15 cm",
		stages: [
			{ label: "Zaaien", durationDays: 5 },
			{ label: "Kiem", durationDays: 7 },
			{ label: "Blad", durationDays: 20 },
			{ label: "Groeispurt", durationDays: 20 },
			{ label: "Oogsten", durationDays: 25 },
		],
		totalDays: 77,
		placement: "inside",
		sunlight: "full",
		careLevel: "daily",
	},
	veg_lettuce: {
		name: "Sla",
		image: IMG("Sla"),
		light: "Halfschaduw",
		water: "Regelmatig water geven",
		difficulty: "Gemakkelijk",
		temperature: { min: 10, max: 20 },
		sowingPeriod: { startMonth: 3, endMonth: 8 },
		sowingDepth: "0.5 cm",
		sowingDistance: "25 cm",
		potDepth: "15 cm",
		stages: [
			{ label: "Zaaien", durationDays: 5 },
			{ label: "Kiem", durationDays: 7 },
			{ label: "Blad", durationDays: 20 },
			{ label: "Oogsten", durationDays: 10 },
		],
		totalDays: 42,
		placement: "outside",
		sunlight: "partial",
		careLevel: "weekly",
	},
	veg_strawberry: {
		name: "Aardbei",
		image: IMG("Aardbei"),
		light: "Halfschaduw",
		water: "Regelmatig water geven",
		difficulty: "Gemiddeld",
		temperature: { min: 12, max: 24 },
		sowingPeriod: { startMonth: 2, endMonth: 5 },
		sowingDepth: "0.5 cm",
		sowingDistance: "30 cm",
		potDepth: "20 cm",
		stages: [
			{ label: "Zaaien", durationDays: 14 },
			{ label: "Kiem", durationDays: 14 },
			{ label: "Blad", durationDays: 30 },
			{ label: "Bloeien", durationDays: 20 },
			{ label: "Oogsten", durationDays: 30 },
		],
		totalDays: 108,
		placement: "both",
		sunlight: "partial",
		careLevel: "weekly",
	},
	veg_carrot: {
		name: "Wortel",
		image: IMG("Wortel"),
		light: "Volle zon",
		water: "Regelmatig water geven",
		difficulty: "Gemakkelijk",
		temperature: { min: 10, max: 22 },
		sowingPeriod: { startMonth: 3, endMonth: 7 },
		sowingDepth: "1 cm",
		sowingDistance: "10 cm",
		potDepth: "30 cm",
		stages: [
			{ label: "Zaaien", durationDays: 10 },
			{ label: "Kiem", durationDays: 14 },
			{ label: "Blad", durationDays: 30 },
			{ label: "Groeispurt", durationDays: 40 },
			{ label: "Oogsten", durationDays: 20 },
		],
		totalDays: 114,
		placement: "outside",
		sunlight: "full",
		careLevel: "weekly",
	},
	veg_mint: {
		name: "Munt",
		image: IMG("Munt"),
		light: "Halfschaduw",
		water: "Veel water",
		difficulty: "Gemakkelijk",
		temperature: { min: 10, max: 25 },
		sowingPeriod: { startMonth: 3, endMonth: 6 },
		sowingDepth: "0.5 cm",
		sowingDistance: "30 cm",
		potDepth: "20 cm",
		stages: [
			{ label: "Zaaien", durationDays: 7 },
			{ label: "Kiem", durationDays: 10 },
			{ label: "Blad", durationDays: 20 },
			{ label: "Groeispurt", durationDays: 30 },
			{ label: "Oogsten", durationDays: 30 },
		],
		totalDays: 97,
		placement: "both",
		sunlight: "partial",
		careLevel: "minimal",
	},
	veg_spinach: {
		name: "Spinazie",
		image: IMG("Spinazie"),
		light: "Halfschaduw",
		water: "Regelmatig water geven",
		difficulty: "Gemakkelijk",
		temperature: { min: 5, max: 20 },
		sowingPeriod: { startMonth: 2, endMonth: 4 },
		sowingDepth: "2 cm",
		sowingDistance: "15 cm",
		potDepth: "15 cm",
		stages: [
			{ label: "Zaaien", durationDays: 7 },
			{ label: "Kiem", durationDays: 10 },
			{ label: "Blad", durationDays: 20 },
			{ label: "Oogsten", durationDays: 10 },
		],
		totalDays: 47,
		placement: "outside",
		sunlight: "partial",
		careLevel: "weekly",
	},
};

export const VEGETABLES: VegetableInfo[] = VEGETABLE_LIST;
export const VEGETABLE_DETAILS: Record<string, VegetableDetail> = VEGETABLE_DETAILS_RECORD;
