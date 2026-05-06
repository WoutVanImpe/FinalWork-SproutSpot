import { Request, Response } from "express";
import { TelemetryService } from "../services/telemetry.service";
import { TelemetryPayloadDto } from "../types/dto";

export class TelemetryController {
	private service: TelemetryService;

	constructor() {
		this.service = new TelemetryService();
	}

	/**
	 * @description Accept telemetry data from an XIAO ESP32-C3 probe. Maps raw soil moisture values and updates probe battery/WiFi health in the same call.
	 * @param {Request} req - Express request with { hardware_id, temp_c, humidity_pct, light_lux, soil_raw, battery_voltage, wifi_rssi } in body.
	 * @param {Response} res - Express response with created telemetry entry.
	 * @returns {void}
	 */
	uploadTelemetry = async (req: Request, res: Response) => {
		try {
			const { hardware_id, temp_c, humidity_pct, light_lux, soil_raw, battery_voltage, wifi_rssi } = req.body;

			if (!hardware_id) {
				res.status(400).json({ error: "Validation Error", message: "hardware_id is required" });
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

			const entry = await this.service.uploadTelemetry(payload);

			res.status(201).json({ success: true, message: "Telemetry uploaded", data: entry });
		} catch (error) {
			console.error("[TelemetryController] Error:", error);
			res.status(500).json({ error: "Internal Server Error", message: "Failed to upload telemetry" });
		}
	};

	/**
	 * @description Retrieve recent telemetry entries for a specific probe, ordered newest first. Defaults to 24 entries.
	 * @param {Request} req - Express request with sondeId as URL parameter and optional limit query param.
	 * @param {Response} res - Express response with list of telemetry entries.
	 * @returns {void}
	 */
	getRecentTelemetry = async (req: Request, res: Response) => {
		try {
			const { sondeId } = req.params;
			const limit = Number.parseInt(req.query.limit as string) || 24;

			if (!sondeId) {
				res.status(400).json({ error: "Validation Error", message: "sondeId is required" });
				return;
			}

			const entries = await this.service.getRecentTelemetry(sondeId as string, limit);

			res.status(200).json({ success: true, count: entries.length, data: entries });
		} catch (error) {
			console.error("[TelemetryController] Error:", error);
			res.status(500).json({ error: "Internal Server Error", message: "Failed to retrieve telemetry" });
		}
	};
}
