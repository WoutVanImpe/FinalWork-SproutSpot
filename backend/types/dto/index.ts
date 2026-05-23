export interface CreateUserDto {
	name: string;
	email: string;
	password: string;
}

export interface LoginDto {
	email: string;
	password: string;
}

export interface UpdateProfileDto {
	name?: string;
	profile_picture?: string;
	push_token?: string;
	push_enabled?: boolean;
	notification_window_start?: string;
	notification_window_end?: string;
}

export interface CreateUserPlantDto {
	nickname: string;
	user_id: number;
	plant_id: number;
	garden_id?: number;
	x_pos: number;
	y_pos: number;
	sonde_id?: string;
}

export interface UpdatePlantStageDto {
	user_plant_id: number;
	new_stage_order: number;
}

export interface DeactivatePlantDto {
	user_plant_id: number;
	reason: "harvested" | "died" | "removed" | "reused";
}

export interface TelemetryEntryDto {
	temp_c: number;
	light_lux: number;
	soil_raw: number;
	battery_voltage: number;
	wifi_rssi: number;
	time_t: number;
}

export interface TelemetryBatchUploadDto {
	hardware_id: string;
	entries: TelemetryEntryDto[];
}

export interface TelemetryPayloadDto {
	hardware_id: string;
	temp_c: number;
	light_lux: number;
	soil_raw: number;
	battery_voltage: number;
	wifi_rssi: number;
}

export interface GardenPositionDto {
	x_pos: number;
	y_pos: number;
}

export interface UpdatePasswordDto {
	current_password: string;
	new_password: string;
}

export interface UpdateGardenDimensionsDto {
	width: number;
	height: number;
}

export interface MovePlantDto {
	garden_id: number;
	x_pos: number;
	y_pos: number;
}

export interface SnoozeNotificationDto {
	minutes?: number;
}

export interface RenameProbeDto {
	name: string;
}

export interface RenameProbeByCodeDto {
	pairing_code: string;
	name: string;
}
