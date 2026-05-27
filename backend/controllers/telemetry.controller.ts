import { Request, Response } from "express";
import { TelemetryService } from "../services/telemetry.service";
import { TelemetryBatchUploadDto } from "../types/dto";

export class TelemetryController {
	private service: TelemetryService;

	constructor() {
		this.service = new TelemetryService();
	}

	/**
	 * @description Accept a batch of telemetry entries from an XIAO ESP32-C3 probe. Each entry uses the hardware's time_t (Unix epoch) as its timestamp.
	 * @param {Request} req - Express request with { hardware_id, entries } in body, where entries is an array of 4 telemetry readings.
	 * @param {Response} res - Express response with created telemetry entries.
	 * @returns {void}
	 */
	uploadTelemetry = async (req: Request, res: Response) => {
		try {
			const { hardware_id, entries, is_charging } = req.body;

			if (!hardware_id) {
				res.status(400).json({ error: "Validation Error", message: "hardware_id is required" });
				return;
			}

			if (is_charging) {
				await this.service.handleChargingUpdate(hardware_id, req.body);
				res.status(200).json({ success: true, message: "Charging status updated" });
				return;
			}

			if (!Array.isArray(entries) || entries.length === 0) {
				res.status(400).json({ error: "Validation Error", message: "entries must be a non-empty array" });
				return;
			}

			const payload: TelemetryBatchUploadDto = { hardware_id, entries };
			const created = await this.service.uploadTelemetry(payload);

			res.status(201).json({ success: true, message: "Telemetry uploaded", count: created.length, data: created });
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
