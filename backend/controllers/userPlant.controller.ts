import { Request, Response } from "express";
import { UserPlantService } from "../services/userPlant.service";
import { CreateUserPlantDto, UpdatePlantStageDto, DeactivatePlantDto } from "../types/dto";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export class UserPlantController {
	private readonly service: UserPlantService;

	constructor() {
		this.service = new UserPlantService();
	}

	getUserPlants = async (req: AuthenticatedRequest, res: Response) => {
		try {
			const userId = req.user?.id;

			if (!userId) {
				res.status(401).json({ error: "Unauthorized", message: "User authentication required" });
				return;
			}

			const plants = await this.service.getUserPlants(userId);

			res.status(200).json({ success: true, count: plants.length, data: plants });
		} catch (error) {
			console.error("[UserPlantController] Error:", error);
			res.status(500).json({ error: "Internal Server Error", message: "Failed to retrieve user plants" });
		}
	};

	getActivePlants = async (req: AuthenticatedRequest, res: Response) => {
		try {
			const userId = req.user?.id;

			if (!userId) {
				res.status(401).json({ error: "Unauthorized", message: "User authentication required" });
				return;
			}

			const plants = await this.service.getActiveUserPlants(userId);

			res.status(200).json({ success: true, count: plants.length, data: plants });
		} catch (error) {
			console.error("[UserPlantController] Error:", error);
			res.status(500).json({ error: "Internal Server Error", message: "Failed to retrieve active plants" });
		}
	};

	getPlantDetails = async (req: Request, res: Response) => {
		try {
			const id = Number.parseInt(req.params.id as string);

			if (Number.isNaN(id)) {
				res.status(400).json({ error: "Validation Error", message: "Invalid plant ID" });
				return;
			}

			const plant = await this.service.getPlantDetails(id);

			res.status(200).json({ success: true, data: plant });
		} catch (error) {
			if ((error as Error).message === "Plant not found") {
				res.status(404).json({ error: "Not Found", message: (error as Error).message });
				return;
			}

			console.error("[UserPlantController] Error:", error);
			res.status(500).json({ error: "Internal Server Error", message: "Failed to retrieve plant details" });
		}
	};

	createPlant = async (req: AuthenticatedRequest, res: Response) => {
		try {
			const userId = req.user?.id;

			if (!userId) {
				res.status(401).json({ error: "Unauthorized", message: "User authentication required" });
				return;
			}

			const { name, plant_id, garden_id, x_pos, y_pos, sonde_id } = req.body;

			if (!plant_id || x_pos === undefined || y_pos === undefined) {
				res.status(400).json({ error: "Validation Error", message: "plant_id, x_pos, and y_pos are required" });
				return;
			}

			const input: CreateUserPlantDto = {
				name: name || "My Plant",
				user_id: userId,
				plant_id,
				garden_id,
				x_pos,
				y_pos,
				sonde_id,
			};

			const plant = await this.service.createPlant(input);

			res.status(201).json({ success: true, message: "Plant added to your garden", data: plant });
		} catch (error) {
			const msg = (error as Error).message;
			if (msg === "Plant not found in encyclopedia" || msg === "This garden position is already occupied") {
				res.status(400).json({ error: "Bad Request", message: msg });
				return;
			}

			console.error("[UserPlantController] Error:", error);
			res.status(500).json({ error: "Internal Server Error", message: "Failed to create plant" });
		}
	};

	advanceStage = async (req: Request, res: Response) => {
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
			const plant = await this.service.advanceStage(input);

			res.status(200).json({ success: true, message: "Growth stage updated successfully", data: plant });
		} catch (error) {
			const msg = (error as Error).message;
			if (msg.includes("not found") || msg.includes("inactive") || msg.includes("No next stage") || msg.includes("Invalid stage")) {
				res.status(400).json({ error: "Bad Request", message: msg });
				return;
			}

			console.error("[UserPlantController] Error:", error);
			res.status(500).json({ error: "Internal Server Error", message: "Failed to update growth stage" });
		}
	};

	deactivatePlant = async (req: Request, res: Response) => {
		try {
			const userPlantId = Number.parseInt(req.params.id as string);

			if (Number.isNaN(userPlantId)) {
				res.status(400).json({ error: "Validation Error", message: "Invalid plant ID" });
				return;
			}

			const { reason } = req.body;

			if (!reason || !["harvested", "died", "removed", "reused"].includes(reason)) {
				res.status(400).json({ error: "Validation Error", message: "Valid deactivation reason required: harvested, died, removed, or reused" });
				return;
			}

			const input: DeactivatePlantDto = { user_plant_id: userPlantId, reason };
			const plant = await this.service.deactivatePlant(input);

			res.status(200).json({ success: true, message: `Plant marked as ${reason}`, data: plant });
		} catch (error) {
			const msg = (error as Error).message;
			if (msg.includes("not found") || msg.includes("already inactive")) {
				res.status(400).json({ error: "Bad Request", message: msg });
				return;
			}

			console.error("[UserPlantController] Error:", error);
			res.status(500).json({ error: "Internal Server Error", message: "Failed to deactivate plant" });
		}
	};

	calculateMatch = async (req: AuthenticatedRequest, res: Response) => {
		try {
			const userId = req.user?.id;
			const targetPlantId = Number.parseInt(req.params.plantId as string);

			if (!userId) {
				res.status(401).json({ error: "Unauthorized", message: "User authentication required" });
				return;
			}

			if (Number.isNaN(targetPlantId)) {
				res.status(400).json({ error: "Validation Error", message: "Invalid plant ID" });
				return;
			}

			const matchPercentage = await this.service.calculateMatchPercentage(userId, targetPlantId);

			res.status(200).json({ success: true, data: { plant_id: targetPlantId, match_percentage: matchPercentage } });
		} catch (error) {
			if ((error as Error).message === "Plant not found in encyclopedia") {
				res.status(404).json({ error: "Not Found", message: (error as Error).message });
				return;
			}

			console.error("[UserPlantController] Error:", error);
			res.status(500).json({ error: "Internal Server Error", message: "Failed to calculate match percentage" });
		}
	};

	movePlant = async (req: Request, res: Response) => {
		try {
			const userPlantId = Number.parseInt(req.params.id as string);

			if (Number.isNaN(userPlantId)) {
				res.status(400).json({ error: "Validation Error", message: "Invalid plant ID" });
				return;
			}

			const { garden_id, x_pos, y_pos } = req.body;

			if (garden_id === undefined || x_pos === undefined || y_pos === undefined) {
				res.status(400).json({ error: "Validation Error", message: "garden_id, x_pos, and y_pos are required" });
				return;
			}

			const plant = await this.service.movePlant(userPlantId, garden_id, x_pos, y_pos);

			res.status(200).json({ success: true, message: "Plant moved successfully", data: plant });
		} catch (error) {
			const msg = (error as Error).message;
			if (msg.includes("not found") || msg.includes("occupied")) {
				res.status(400).json({ error: "Bad Request", message: msg });
				return;
			}

			console.error("[UserPlantController] Error:", error);
			res.status(500).json({ error: "Internal Server Error", message: "Failed to move plant" });
		}
	};
}
