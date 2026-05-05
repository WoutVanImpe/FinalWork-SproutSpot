import { Response } from "express";
import { GardenService } from "../services/garden.service";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export class GardenController {
	private readonly service: GardenService;

	constructor() {
		this.service = new GardenService();
	}

	getUserGardens = async (req: AuthenticatedRequest, res: Response) => {
		try {
			const userId = req.user?.id;

			if (!userId) {
				res.status(401).json({ error: "Unauthorized", message: "User authentication required" });
				return;
			}

			const gardens = await this.service.getUserGardens(userId);

			res.status(200).json({ success: true, count: gardens.length, data: gardens });
		} catch (error) {
			console.error("[GardenController] Error:", error);
			res.status(500).json({ error: "Internal Server Error", message: "Failed to retrieve gardens" });
		}
	};

	getGardenDetails = async (req: AuthenticatedRequest, res: Response) => {
		try {
			const userId = req.user?.id;
			const gardenId = Number.parseInt(req.params.id as string);

			if (!userId) {
				res.status(401).json({ error: "Unauthorized", message: "User authentication required" });
				return;
			}

			if (Number.isNaN(gardenId)) {
				res.status(400).json({ error: "Validation Error", message: "Invalid garden ID" });
				return;
			}

			const details = await this.service.getGardenDetails(gardenId, userId);

			res.status(200).json({ success: true, data: details });
		} catch (error) {
			if ((error as Error).message === "Garden not found") {
				res.status(404).json({ error: "Not Found", message: (error as Error).message });
				return;
			}

			console.error("[GardenController] Error:", error);
			res.status(500).json({ error: "Internal Server Error", message: "Failed to retrieve garden details" });
		}
	};

	updateDimensions = async (req: AuthenticatedRequest, res: Response) => {
		try {
			const userId = req.user?.id;
			const gardenId = Number.parseInt(req.params.id as string);

			if (!userId) {
				res.status(401).json({ error: "Unauthorized", message: "User authentication required" });
				return;
			}

			const { width, height } = req.body;

			if (width === undefined || height === undefined) {
				res.status(400).json({ error: "Validation Error", message: "width and height are required" });
				return;
			}

			const garden = await this.service.updateDimensions(gardenId, userId, width, height);

			res.status(200).json({ success: true, message: "Garden dimensions updated", data: garden });
		} catch (error) {
			const msg = (error as Error).message;
			if (msg.includes("not found") || msg.includes("Dimensions")) {
				res.status(400).json({ error: "Bad Request", message: msg });
				return;
			}

			console.error("[GardenController] Error:", error);
			res.status(500).json({ error: "Internal Server Error", message: "Failed to update garden dimensions" });
		}
	};
}
