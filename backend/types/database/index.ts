export interface StageThresholdsRecord {
	soil_min: number;
	soil_max: number;
	temp_min: number;
	temp_max: number;
	light_min: number;
	light_max: number;
	required_daily_sun_hours: number;
}

export interface UserRecord {
	id: number;
	name: string;
	profile_picture: string | null;
	email: string;
	password_hash: string;
	push_token: string | null;
	push_enabled: boolean;
	notification_window_start: string | null;
	notification_window_end: string | null;
	pairing_code: string;
	created_at: Date;
}

export interface PlantRecord {
	id: number;
	name: string;
	light: string;
	water: string;
	difficulty: string;
	temperature: string;
	planting_type: "indoor" | "outdoor" | "both";
	image: string;
	sunlight: "full" | "partial" | "shade" | null;
	care_level: "daily" | "weekly" | "minimal" | null;
	temperature_min: number | null;
	temperature_max: number | null;
	total_days: number | null;
	sowing_depth: number;
	sowing_distance: number;
	pot_min_depth: number;
	sowing_period: string[];
	germination_time: string;
	repotting_after: string;
	total_growth_time: string;
}

export interface PlantStageRecord {
	id: number;
	plant_id: number;
	stage_name: string;
	stage_order: number;
	duration_days: number;
	thresholds: StageThresholdsRecord;
	validation_description: string;
	requirements: Record<string, unknown> | null;
	instructions: Record<string, unknown> | null;
}

export interface ProbeRecord {
	id: number;
	hardware_id: string;
	name: string;
	user_id: number | null;
	state: "paired" | "available" | "offline";
	pairing_code: string | null;
	battery_voltage: number;
	wifi_rssi: number;
	last_seen: Date;
}

export interface UserGardenRecord {
	id: number;
	user_id: number;
	width: number;
	height: number;
	created_at: Date;
}

export interface UserPlantRecord {
	id: number;
	user_id: number;
	plant_id: number;
	nickname: string | null;
	sonde_id: string | null;
	date_sown: Date;
	current_stage_order: number;
	last_stage_update: Date;
	is_active: boolean;
	garden_id: number | null;
	x_pos: number | null;
	y_pos: number | null;
	created_at: Date;
	deactivation_reason: "harvested" | "died" | "removed" | "reused" | null;
	deactivated_at: Date | null;
}

export interface ProbeEntryRecord {
	id: number;
	sonde_id: string | null;
	temp_c: number | null;
	light_lux: number | null;
	soil_moist_pct: number | null;
	battery_voltage: number;
	wifi_rssi: number;
	created_at: Date;
}

export interface ActiveIssueRecord {
	id: number;
	user_plant_id: number;
	issue_type: string;
	occurrence_count: number;
	resolved_at: Date | null;
	user_acknowledged: boolean;
	start_time: Date;
	last_seen: Date;
}

export interface PendingNotificationRecord {
	id: number;
	user_id: number;
	user_plant_id: number;
	issue_id: number | null;
	title: string;
	message: string;
	notification_type: "sensor_alert" | "stage_validation" | "system_status";
	notification_state: "sent" | "acknowledged" | "snoozed";
	snoozed_until: Date | null;
	created_at: Date;
}
