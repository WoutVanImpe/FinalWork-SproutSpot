import { Request, Response } from "express";
import { TelemetryService } from "../services/telemetry.service";
import { TelemetryPayloadDto } from "../types/dto";

export class TelemetryController {
	private readonly service: TelemetryService;

	constructor() {
		this.service = new TelemetryService();
	}

	receiveTelemetry = async (req: Request, res: Response) => {
		try {
			const { hardware_id, temp_c, humidity_pct, light_lux, soil_raw, battery_voltage, wifi_rssi } = req.body;

			if (!hardware_id) {
				res.status(400).json({
					error: "Validation Error",
					message: "hardware_id is required",
				});
				return;
			}

			const payload: TelemetryPayloadDto = {
				hardware_id,
				temp_c,
				humidity_pct,
				light_lux,
				soil_raw,
				battery_voltage,
				wifi_rssi,
			};

			const result = await this.service.processTelemetry(payload);

			if (result.issues && result.issues.length > 0) {
				res.status(200).json({
					success: true,
					message: result.message,
					entry_id: (result.entry as any).id,
					alerts: result.issues.map((issue) => ({
						type: issue.issue_type,
						message: issue.message,
						advice: issue.coach_advice,
					})),
				});
			} else {
				res.status(200).json({
					success: true,
					message: result.message,
					entry_id: (result.entry as any).id,
				});
			}
		} catch (error) {
			console.error("[TelemetryController] Error:", error);
			res.status(500).json({
				error: "Internal Server Error",
				message: "Failed to process telemetry data",
			});
		}
	};

	getRecentTelemetry = async (req: Request, res: Response) => {
		try {
			const { sondeId } = req.params;
			const limit = Number.parseInt(req.query.limit as string) || 24;

			if (!sondeId) {
				res.status(400).json({
					error: "Validation Error",
					message: "sondeId parameter is required",
				});
				return;
			}

			const entries = await this.service.getRecentTelemetry(sondeId as string, limit);

			res.status(200).json({
				success: true,
				count: entries.length,
				data: entries,
			});
		} catch (error) {
			console.error("[TelemetryController] Error:", error);
			res.status(500).json({
				error: "Internal Server Error",
				message: "Failed to retrieve telemetry data",
			});
		}
	};
}
