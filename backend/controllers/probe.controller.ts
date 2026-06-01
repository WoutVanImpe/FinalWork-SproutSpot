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
	 * @param {Request} req - Express request with { hardware_id, pairing_code } in body.
	 * @param {Response} res - Express response with created probe data or 401 on invalid code.
	 * @returns {void}
	 */
	registerProbe = async (req: Request, res: Response) => {
		try {
			const { hardware_id, pairing_code } = req.body;

			if (!hardware_id) {
				res.status(400).json({ error: "Validation Error", message: "hardware_id is required" });
				return;
			}

			const result = await this.service.registerProbe(hardware_id, pairing_code);

			if (result.existing) {
				res.status(200).json({ success: true, message: "Probe WiFi update acknowledged" });
				return;
			}

			res.status(201).json({ success: true, message: "Probe registered", data: result.probe });
		} catch (error) {
			if ((error as Error).message === "Invalid pairing code") {
				res.status(401).json({ error: "Unauthorized", message: (error as Error).message });
				return;
			}

			if ((error as Error).message === "Pairing code required for new probe") {
				res.status(400).json({ error: "Validation Error", message: (error as Error).message });
				return;
			}

			console.error("[ProbeController] Error:", error);
			res.status(500).json({ error: "Internal Server Error", message: "Failed to register probe" });
		}
	};

	/**
	 * @description Rename a probe by its pairing code. Finds the probe that was registered with this code and renames it. Returns the probe ID so the app can pair it later.
	 * @param {AuthenticatedRequest} req - Authenticated request with { pairing_code, name } in body.
	 * @param {Response} res - Express response with renamed probe data.
	 * @returns {void}
	 */
	renameProbeByCode = async (req: AuthenticatedRequest, res: Response) => {
		try {
			const userId = req.user?.id;
			const { pairing_code, name } = req.body;

			if (!userId) {
				res.status(401).json({ error: "Unauthorized", message: "Authentication required" });
				return;
			}

			if (!pairing_code || !name) {
				res.status(400).json({ error: "Validation Error", message: "pairing_code and name are required" });
				return;
			}

			const probe = await this.service.renameByCode(pairing_code, name, userId);

			res.status(200).json({ success: true, message: "Probe renamed", data: { id: probe.id } });
		} catch (error) {
			if ((error as Error).message === "Probe not found") {
				res.status(404).json({ error: "Not Found", message: "No probe found with this pairing code" });
				return;
			}

			console.error("[ProbeController] Error:", error);
			res.status(500).json({ error: "Internal Server Error", message: "Failed to rename probe" });
		}
	};

	/**
	 * @description Pair a probe to a specific user plant by linking the probe's hardware_id to the plant's sonde_id.
	 * @param {Request} req - Express request with probe ID as URL parameter and { user_plant_id } in body.
	 * @param {Response} res - Express response with paired probe data.
	 * @returns {void}
	 */
	pairProbe = async (req: AuthenticatedRequest, res: Response) => {
		try {
			const userId = req.user?.id;
			const probeId = Number.parseInt(req.params.id as string);
			const { user_plant_id } = req.body;

			if (!userId) {
				res.status(401).json({ error: "Unauthorized", message: "Authentication required" });
				return;
			}

			if (Number.isNaN(probeId) || !user_plant_id) {
				res.status(400).json({ error: "Validation Error", message: "probe ID and user_plant_id are required" });
				return;
			}

			const probe = await this.service.pairProbe(userId, probeId, user_plant_id);

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
	unpairProbe = async (req: AuthenticatedRequest, res: Response) => {
		try {
			const userId = req.user?.id;
			const userPlantId = Number.parseInt(req.params.userPlantId as string);

			if (!userId) {
				res.status(401).json({ error: "Unauthorized", message: "Authentication required" });
				return;
			}

			if (Number.isNaN(userPlantId)) {
				res.status(400).json({ error: "Validation Error", message: "userPlantId is required" });
				return;
			}

			await this.service.unpairProbe(userId, userPlantId);

			res.status(200).json({ success: true, message: "Probe unpaired from plant" });
		} catch (error) {
			console.error("[ProbeController] Error:", error);
			res.status(500).json({ error: "Internal Server Error", message: "Failed to unpair probe" });
		}
	};

	/**
	 * @description Rename an existing probe. Only the owning user can rename their probe.
	 * @param {AuthenticatedRequest} req - Authenticated request with probe ID as URL parameter and { name } in body.
	 * @param {Response} res - Express response with updated probe data.
	 * @returns {void}
	 */
	renameProbe = async (req: AuthenticatedRequest, res: Response) => {
		try {
			const userId = req.user?.id;
			const probeId = Number.parseInt(req.params.id as string);
			const { name } = req.body;

			if (!userId) {
				res.status(401).json({ error: "Unauthorized", message: "Authentication required" });
				return;
			}

			if (Number.isNaN(probeId) || !name) {
				res.status(400).json({ error: "Validation Error", message: "probe ID and name are required" });
				return;
			}

			const probe = await this.service.renameProbe(userId, probeId, name);

			res.status(200).json({ success: true, message: "Probe renamed", data: probe });
		} catch (error) {
			if ((error as Error).message === "Probe not found") {
				res.status(404).json({ error: "Not Found", message: (error as Error).message });
				return;
			}

			console.error("[ProbeController] Error:", error);
			res.status(500).json({ error: "Internal Server Error", message: "Failed to rename probe" });
		}
	};

	/**
	 * @description Sync probe status from hardware. Updates battery/wifi last_seen, returns paired state. No auth required — the probe uses its hardware_id as identification.
	 * @param {Request} req - Express request with { hardware_id, battery_voltage, wifi_rssi } in body.
	 * @param {Response} res - Express response with paired state.
	 * @returns {void}
	 */
	syncProbe = async (req: Request, res: Response) => {
		try {
			const { hardware_id, battery_voltage, wifi_rssi } = req.body;

			if (!hardware_id || battery_voltage == null || wifi_rssi == null) {
				res.status(400).json({ error: "Validation Error", message: "hardware_id, battery_voltage, and wifi_rssi are required" });
				return;
			}

			const result = await this.service.syncProbe(hardware_id, battery_voltage, wifi_rssi);

			res.status(200).json({ success: true, data: result });
		} catch (error) {
			console.error("[ProbeController] Error:", error);
			res.status(500).json({ error: "Internal Server Error", message: "Failed to sync probe" });
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
