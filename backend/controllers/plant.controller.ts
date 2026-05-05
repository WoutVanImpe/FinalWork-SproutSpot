import { Request, Response } from "express";
import { PlantService } from "../services/plant.service";

export class PlantController {
	private readonly service: PlantService;

	constructor() {
		this.service = new PlantService();
	}

	getAllPlants = async (_req: Request, res: Response) => {
		try {
			const plants = await this.service.getAllPlants();

			res.status(200).json({ success: true, count: plants.length, data: plants });
		} catch (error) {
			console.error("[PlantController] Error:", error);
			res.status(500).json({ error: "Internal Server Error", message: "Failed to retrieve plants" });
		}
	};

	getPlantById = async (req: Request, res: Response) => {
		try {
			const plantId = Number.parseInt(req.params.id as string);

			if (Number.isNaN(plantId)) {
				res.status(400).json({ error: "Validation Error", message: "Invalid plant ID" });
				return;
			}

			const plant = await this.service.getPlantById(plantId);

			res.status(200).json({ success: true, data: plant });
		} catch (error) {
			if ((error as Error).message === "Plant not found in encyclopedia") {
				res.status(404).json({ error: "Not Found", message: (error as Error).message });
				return;
			}

			console.error("[PlantController] Error:", error);
			res.status(500).json({ error: "Internal Server Error", message: "Failed to retrieve plant" });
		}
	};

	searchPlants = async (req: Request, res: Response) => {
		try {
			const { q } = req.query;

			if (!q || typeof q !== "string") {
				res.status(400).json({ error: "Validation Error", message: "Search query parameter 'q' is required" });
				return;
			}

			const plants = await this.service.searchPlants(q);

			res.status(200).json({ success: true, count: plants.length, data: plants });
		} catch (error) {
			console.error("[PlantController] Error:", error);
			res.status(500).json({ error: "Internal Server Error", message: "Failed to search plants" });
		}
	};

	getPlantStages = async (req: Request, res: Response) => {
		try {
			const plantId = Number.parseInt(req.params.id as string);

			if (Number.isNaN(plantId)) {
				res.status(400).json({ error: "Validation Error", message: "Invalid plant ID" });
				return;
			}

			const stages = await this.service.getPlantStages(plantId);

			res.status(200).json({ success: true, count: stages.length, data: stages });
		} catch (error) {
			if ((error as Error).message === "Plant not found in encyclopedia") {
				res.status(404).json({ error: "Not Found", message: (error as Error).message });
				return;
			}

			console.error("[PlantController] Error:", error);
			res.status(500).json({ error: "Internal Server Error", message: "Failed to retrieve plant stages" });
		}
	};
}
