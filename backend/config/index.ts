export const PORT = process.env.API_PORT;
export const DATABASE_HOST = process.env.DATABASE_HOST || "localhost";
export const DATABASE_PORT = process.env.DATABASE_PORT;
export const DATABASE_USER = process.env.DATABASE_USER;
export const DATABASE_PASSWORD = process.env.DATABASE_PASSWORD;
export const DATABASE_DB = process.env.DATABASE_DB;
export const JWT_SECRET = process.env.JWT_SECRET || "sproutspot-dev-secret-key-change-in-production";
export const DEEP_SLEEP_INTERVAL_MINUTES = 60;
export const ENTRIES_PER_CYCLE = 4;
export const DLI_HOURS_PER_ENTRY = DEEP_SLEEP_INTERVAL_MINUTES / ENTRIES_PER_CYCLE / 60; // = 0.25
export const ANTI_SPAM_MEASUREMENT_THRESHOLD = 3;

export const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL || `http://localhost:${process.env.API_PORT || "5001"}`;

export function buildImageUrl(filename: string): string {
	if (!filename || filename.startsWith("http")) return filename;
	return `${BACKEND_BASE_URL}/images/plants/${filename}`;
}