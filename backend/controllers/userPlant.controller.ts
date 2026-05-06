import { Request, Response } from "express";
import { UserPlantService } from "../services/userPlant.service";
import { CreateUserPlantDto, UpdatePlantStageDto, DeactivatePlantDto } from "../types/dto";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export class UserPlantController {
	private service: UserPlantService;

	constructor() {
		this.service = new UserPlantService();
	}

	/**
	 * @description Retrieve all user plants for the authenticated user, including inactive ones (harvested, died, removed).
	 * @param {AuthenticatedRequest} req - Authenticated request containing user ID.
	 * @param {Response} res - Express response with full plant history.
	 * @returns {void}
	 */
	getAllUserPlants = async (req: AuthenticatedRequest, res: Response) => {
		try {
			const userId = req.user?.id;

			if (!userId) {
				res.status(401).json({ error: "Unauthorized", message: "Authentication required" });
				return;
			}

			const plants = await this.service.getAllUserPlants(userId);

			res.status(200).json({ success: true, count: plants.length, data: plants });
		} catch (error) {
			console.error("[UserPlantController] Error:", error);
			res.status(500).json({ error: "Internal Server Error", message: "Failed to retrieve plants" });
		}
	};

	/**
	 * @description Retrieve only the currently active (growing) plants for the authenticated user.
	 * @param {AuthenticatedRequest} req - Authenticated request containing user ID.
	 * @param {Response} res - Express response with active plant list.
	 * @returns {void}
	 */
	getAllActiveUserPlants = async (req: AuthenticatedRequest, res: Response) => {
		try {
			const userId = req.user?.id;

			if (!userId) {
				res.status(401).json({ error: "Unauthorized", message: "Authentication required" });
				return;
			}

			const plants = await this.service.getAllActiveUserPlants(userId);

			res.status(200).json({ success: true, count: plants.length, data: plants });
		} catch (error) {
			console.error("[UserPlantController] Error:", error);
			res.status(500).json({ error: "Internal Server Error", message: "Failed to retrieve active plants" });
		}
	};

	/**
	 * @description Advance a user plant to the next growth stage. Validates that the plant is active and the requested stage_order matches the next expected stage.
	 * @param {Request} req - Express request with plant ID as URL parameter and { new_stage_order } in body.
	 * @param {Response} res - Express response with updated plant and new stage requirements.
	 * @returns {void}
	 */
	updateStage = async (req: Request, res: Response) => {
		try {
			const userPlantId = Number.parseInt(req.params.id as string);

			if (Number.isNaN(userPlantId)) {
				res.status(400).json({ error: "Validation Error", message: "Invalid plant ID" });
				return;
			}

			const { new_stage_order } = req.body;

			if (!new_stage_order) {
				res.status(400).json({ error: "Validation Error", message: "new_stage_order is required" });
				return;
			}

			const input: UpdatePlantStageDto = { user_plant_id: userPlantId, new_stage_order };
			const result = await this.service.updateStage(input);

			res.status(200).json({ success: true, message: "Stage updated", data: result });
		} catch (error) {
			const msg = (error as Error).message;
			if (msg.includes("not found") || msg.includes("inactive") || msg.includes("No next stage") || msg.includes("Invalid stage")) {
				res.status(400).json({ error: "Bad Request", message: msg });
				return;
			}

			console.error("[UserPlantController] Error:", error);
			res.status(500).json({ error: "Internal Server Error", message: "Failed to update stage" });
		}
	};

	/**
	 * @description Retrieve the current growth stage details for a user plant.
	 * @param {Request} req - Express request with plant ID as URL parameter.
	 * @param {Response} res - Express response with current stage data including care requirements.
	 * @returns {void}
	 */
	getCurrentStage = async (req: Request, res: Response) => {
		try {
			const userPlantId = Number.parseInt(req.params.id as string);

			if (Number.isNaN(userPlantId)) {
				res.status(400).json({ error: "Validation Error", message: "Invalid plant ID" });
				return;
			}

			const stage = await this.service.getCurrentStage(userPlantId);

			res.status(200).json({ success: true, data: stage });
		} catch (error) {
			if ((error as Error).message === "No current stage found for this plant") {
				res.status(404).json({ error: "Not Found", message: (error as Error).message });
				return;
			}

			console.error("[UserPlantController] Error:", error);
			res.status(500).json({ error: "Internal Server Error", message: "Failed to retrieve stage" });
		}
	};

	/**
	 * @description Retrieve the latest telemetry readings from the probe linked to a user plant. Defaults to 24 entries.
	 * @param {Request} req - Express request with plant ID as URL parameter and optional limit query param.
	 * @param {Response} res - Express response with recent sensor readings.
	 * @returns {void}
	 */
	getLastReadings = async (req: Request, res: Response) => {
		try {
			const userPlantId = Number.parseInt(req.params.id as string);
			const limit = Number.parseInt(req.query.limit as string) || 24;

			if (Number.isNaN(userPlantId)) {
				res.status(400).json({ error: "Validation Error", message: "Invalid plant ID" });
				return;
			}

			const readings = await this.service.getLastReadings(userPlantId, limit);

			res.status(200).json({ success: true, count: readings.length, data: readings });
		} catch (error) {
			const msg = (error as Error).message;
			if (msg.includes("not found") || msg.includes("No probe linked")) {
				res.status(400).json({ error: "Bad Request", message: msg });
				return;
			}

			console.error("[UserPlantController] Error:", error);
			res.status(500).json({ error: "Internal Server Error", message: "Failed to retrieve readings" });
		}
	};
}
