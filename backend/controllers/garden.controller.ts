import { Request, Response } from "express";
import { GardenService } from "../services/garden.service";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export class GardenController {
	private service: GardenService;

	constructor() {
		this.service = new GardenService();
	}

	/**
	 * @description Retrieve the authenticated user's garden and all active plants within it. Auto-creates a garden if none exists.
	 * @param {AuthenticatedRequest} req - Authenticated request containing user ID.
	 * @param {Response} res - Express response with garden and active plants data.
	 * @returns {void}
	 */
	getUserGarden = async (req: AuthenticatedRequest, res: Response) => {
		try {
			const userId = req.user?.id;

			if (!userId) {
				res.status(401).json({ error: "Unauthorized", message: "Authentication required" });
				return;
			}

			const result = await this.service.getUserGarden(userId);

			res.status(200).json({ success: true, data: result });
		} catch (error) {
			console.error("[GardenController] Error:", error);
			res.status(500).json({ error: "Internal Server Error", message: "Failed to retrieve garden" });
		}
	};

	/**
	 * @description Retrieve the user's garden dashboard with enriched plant data (current stage info) and summary stats.
	 * @param {AuthenticatedRequest} req - Authenticated request containing user ID.
	 * @param {Response} res - Express response with dashboard data.
	 * @returns {void}
	 */
	getDashboard = async (req: AuthenticatedRequest, res: Response) => {
		try {
			const userId = req.user?.id;

			if (!userId) {
				res.status(401).json({ error: "Unauthorized", message: "Authentication required" });
				return;
			}

			const result = await this.service.getUserDashboard(userId);

			res.status(200).json({ success: true, data: result });
		} catch (error) {
			console.error("[GardenController] Error:", error);
			res.status(500).json({ error: "Internal Server Error", message: "Failed to retrieve dashboard" });
		}
	};

	/**
	 * @description Update the garden's dimensions and/or plant positions. Validates dimension range (1-50) and checks for position collisions.
	 * @param {AuthenticatedRequest} req - Authenticated request with { width, height, plant_positions } in body.
	 * @param {Response} res - Express response with updated garden data.
	 * @returns {void}
	 */
	updateGarden = async (req: AuthenticatedRequest, res: Response) => {
		try {
			const userId = req.user?.id;

			if (!userId) {
				res.status(401).json({ error: "Unauthorized", message: "Authentication required" });
				return;
			}

			const { width, height, plant_positions } = req.body;

			if (width === undefined && height === undefined && !plant_positions) {
				res.status(400).json({ error: "Validation Error", message: "Provide width, height, or plant_positions" });
				return;
			}

			const garden = await this.service.updateGarden(userId, { width, height, plant_positions });

			res.status(200).json({ success: true, message: "Garden updated", data: garden });
		} catch (error) {
			const msg = (error as Error).message;
			if (msg.includes("not found") || msg.includes("Dimensions") || msg.includes("occupied")) {
				res.status(400).json({ error: "Bad Request", message: msg });
				return;
			}

			console.error("[GardenController] Error:", error);
			res.status(500).json({ error: "Internal Server Error", message: "Failed to update garden" });
		}
	};
}
