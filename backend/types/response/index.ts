export interface MatchPercentageResponse {
	plant_id: number;
	plant_name: string;
	match_percentage: number;
	reasons: string[];
}

export interface IssueResultResponse {
	issue_type: string;
	severity: "warning" | "critical";
	message: string;
	coach_advice: string;
}

export interface ProbeHealthResponse {
	level: string;
	percentage: number;
}

export interface ProbeWifiResponse {
	quality: string;
	advice: string;
}
