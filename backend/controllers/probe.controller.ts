import { Request, Response } from "express";
import { ProbeService } from "../services/probe.service";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export class ProbeController {
	private readonly service: ProbeService;

	constructor() {
		this.service = new ProbeService();
	}

	registerProbe = async (req: Request, res: Response) => {
		try {
			const { hardware_id, name } = req.body;

			if (!hardware_id || !name) {
				res.status(400).json({ error: "Validation Error", message: "hardware_id and name are required" });
				return;
			}

			const probe = await this.service.registerProbe(hardware_id, name);

			res.status(201).json({ success: true, message: "Probe registered successfully", data: probe });
		} catch (error) {
			if ((error as Error).message === "Probe with this hardware ID already exists") {
				res.status(409).json({ error: "Conflict", message: (error as Error).message });
				return;
			}

			console.error("[ProbeController] Error:", error);
			res.status(500).json({ error: "Internal Server Error", message: "Failed to register probe" });
		}
	};

	pairProbe = async (req: AuthenticatedRequest, res: Response) => {
		try {
			const userId = req.user?.id;

			if (!userId) {
				res.status(401).json({ error: "Unauthorized", message: "User authentication required" });
				return;
			}

			const probeId = Number.parseInt(req.params.id as string);

			if (Number.isNaN(probeId)) {
				res.status(400).json({ error: "Validation Error", message: "Invalid probe ID" });
				return;
			}

			const probe = await this.service.pairProbe(probeId, userId);

			res.status(200).json({ success: true, message: "Probe paired successfully", data: probe });
		} catch (error) {
			const msg = (error as Error).message;
			if (msg.includes("not found") || msg.includes("already paired")) {
				res.status(400).json({ error: "Bad Request", message: msg });
				return;
			}

			console.error("[ProbeController] Error:", error);
			res.status(500).json({ error: "Internal Server Error", message: "Failed to pair probe" });
		}
	};

	unpairProbe = async (req: AuthenticatedRequest, res: Response) => {
		try {
			const userId = req.user?.id;

			if (!userId) {
				res.status(401).json({ error: "Unauthorized", message: "User authentication required" });
				return;
			}

			const probeId = Number.parseInt(req.params.id as string);

			if (Number.isNaN(probeId)) {
				res.status(400).json({ error: "Validation Error", message: "Invalid probe ID" });
				return;
			}

			const probe = await this.service.unpairProbe(probeId, userId);

			res.status(200).json({ success: true, message: "Probe unpaired", data: probe });
		} catch (error) {
			const msg = (error as Error).message;
			if (msg.includes("not found") || msg.includes("do not own")) {
				res.status(400).json({ error: "Bad Request", message: msg });
				return;
			}

			console.error("[ProbeController] Error:", error);
			res.status(500).json({ error: "Internal Server Error", message: "Failed to unpair probe" });
		}
	};

	getUserProbes = async (req: AuthenticatedRequest, res: Response) => {
		try {
			const userId = req.user?.id;

			if (!userId) {
				res.status(401).json({ error: "Unauthorized", message: "User authentication required" });
				return;
			}

			const probes = await this.service.getUserProbes(userId);

			const probesWithHealth = probes.map((probe) => ({
				...probe,
				battery: this.service.getBatteryStatus(probe.battery_voltage),
				wifi: this.service.getWifiStatus(probe.wifi_rssi),
			}));

			res.status(200).json({ success: true, count: probes.length, data: probesWithHealth });
		} catch (error) {
			console.error("[ProbeController] Error:", error);
			res.status(500).json({ error: "Internal Server Error", message: "Failed to retrieve probes" });
		}
	};

	getAvailableProbes = async (req: Request, res: Response) => {
		try {
			const probes = await this.service.getAvailableProbes();

			res.status(200).json({ success: true, count: probes.length, data: probes });
		} catch (error) {
			console.error("[ProbeController] Error:", error);
			res.status(500).json({ error: "Internal Server Error", message: "Failed to retrieve available probes" });
		}
	};
}
