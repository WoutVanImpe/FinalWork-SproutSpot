import { Request, Response } from "express";
import { ProbeService } from "../services/probe.service";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export class ProbeController {
	private service: ProbeService;

	constructor() {
		this.service = new ProbeService();
	}

	/**
	 * @description Register a new probe by validating a user's pairing code. On success the probe is linked to the user and the pairing code is rotated.
	 * @param {Request} req - Express request with { hardware_id, name, pairing_code } in body.
	 * @param {Response} res - Express response with created probe data or 401 on invalid code.
	 * @returns {void}
	 */
	registerProbe = async (req: Request, res: Response) => {
		try {
			const { hardware_id, name, pairing_code } = req.body;

			if (!hardware_id || !name || !pairing_code) {
				res.status(400).json({ error: "Validation Error", message: "hardware_id, name, and pairing_code are required" });
				return;
			}

			const probe = await this.service.registerProbe(hardware_id, name, pairing_code);

			res.status(201).json({ success: true, message: "Probe registered", data: probe });
		} catch (error) {
			if ((error as Error).message === "Probe with this hardware ID already exists") {
				res.status(409).json({ error: "Conflict", message: (error as Error).message });
				return;
			}

			if ((error as Error).message === "Invalid pairing code") {
				res.status(401).json({ error: "Unauthorized", message: (error as Error).message });
				return;
			}

			console.error("[ProbeController] Error:", error);
			res.status(500).json({ error: "Internal Server Error", message: "Failed to register probe" });
		}
	};

	/**
	 * @description Pair a probe to a specific user plant by linking the probe's hardware_id to the plant's sonde_id.
	 * @param {Request} req - Express request with probe ID as URL parameter and { user_plant_id } in body.
	 * @param {Response} res - Express response with paired probe data.
	 * @returns {void}
	 */
	pairProbe = async (req: Request, res: Response) => {
		try {
			const probeId = Number.parseInt(req.params.id as string);
			const { user_plant_id } = req.body;

			if (Number.isNaN(probeId) || !user_plant_id) {
				res.status(400).json({ error: "Validation Error", message: "probe ID and user_plant_id are required" });
				return;
			}

			const probe = await this.service.pairProbe(probeId, user_plant_id);

			res.status(200).json({ success: true, message: "Probe paired to plant", data: probe });
		} catch (error) {
			const msg = (error as Error).message;
			if (msg.includes("not found")) {
				res.status(404).json({ error: "Not Found", message: msg });
				return;
			}

			console.error("[ProbeController] Error:", error);
			res.status(500).json({ error: "Internal Server Error", message: "Failed to pair probe" });
		}
	};

	/**
	 * @description Unpair a probe from a user plant by setting the plant's sonde_id to null.
	 * @param {Request} req - Express request with userPlantId as URL parameter.
	 * @param {Response} res - Express response with success confirmation.
	 * @returns {void}
	 */
	unpairProbe = async (req: Request, res: Response) => {
		try {
			const userPlantId = Number.parseInt(req.params.userPlantId as string);

			if (Number.isNaN(userPlantId)) {
				res.status(400).json({ error: "Validation Error", message: "userPlantId is required" });
				return;
			}

			await this.service.unpairProbe(userPlantId);

			res.status(200).json({ success: true, message: "Probe unpaired from plant" });
		} catch (error) {
			console.error("[ProbeController] Error:", error);
			res.status(500).json({ error: "Internal Server Error", message: "Failed to unpair probe" });
		}
	};

	/**
	 * @description Retrieve the authenticated user's probes with computed battery and WiFi health status. Optionally filter by a single probe ID.
	 * @param {AuthenticatedRequest} req - Authenticated request with optional probe ID as URL parameter.
	 * @param {Response} res - Express response with probe data including battery level percentage and WiFi quality.
	 * @returns {void}
	 */
	getUserProbes = async (req: AuthenticatedRequest, res: Response) => {
		try {
			const userId = req.user?.id;

			if (!userId) {
				res.status(401).json({ error: "Unauthorized", message: "Authentication required" });
				return;
			}

			const probeId = req.params.id ? Number.parseInt(req.params.id as string) : undefined;

			if (probeId && Number.isNaN(probeId)) {
				res.status(400).json({ error: "Validation Error", message: "Invalid probe ID" });
				return;
			}

			const result = await this.service.getUserProbes(userId, probeId);
			const data = Array.isArray(result)
				? result.map((probe) => ({
					...probe,
					battery: this.service.getBatteryStatus(probe.battery_voltage),
					wifi: this.service.getWifiStatus(probe.wifi_rssi),
				}))
				: {
					...(result as any),
					battery: this.service.getBatteryStatus((result as any).battery_voltage),
					wifi: this.service.getWifiStatus((result as any).wifi_rssi),
				};

			res.status(200).json({ success: true, data });
		} catch (error) {
			if ((error as Error).message === "Probe not found") {
				res.status(404).json({ error: "Not Found", message: (error as Error).message });
				return;
			}

			console.error("[ProbeController] Error:", error);
			res.status(500).json({ error: "Internal Server Error", message: "Failed to retrieve probes" });
		}
	};
}
