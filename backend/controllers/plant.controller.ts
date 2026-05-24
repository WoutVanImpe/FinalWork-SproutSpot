import { Request, Response } from "express";
import { PlantService } from "../services/plant.service";
import { toPlantListItem, toPlantDetail, toStageInfo } from "../utils/plantMapper";

export class PlantController {
	private service: PlantService;

	constructor() {
		this.service = new PlantService();
	}

	/**
	 * @description Retrieve all plants from the encyclopedia, ordered alphabetically.
	 * @param {Request} req - Express request (unused).
	 * @param {Response} res - Express response with full list of plants.
	 * @returns {void}
	 */
	getAllPlants = async (req: Request, res: Response) => {
		try {
			const plants = await this.service.getAllPlants();
			const mapped = plants.map(toPlantListItem);

			res.status(200).json({ success: true, count: mapped.length, data: mapped });
		} catch (error) {
			console.error("[PlantController] Error:", error);
			res.status(500).json({ error: "Internal Server Error", message: "Failed to retrieve plants" });
		}
	};

	/**
	 * @description Retrieve a single plant from the encyclopedia by its ID with full detail including stages.
	 * @param {Request} req - Express request with plant ID as URL parameter.
	 * @param {Response} res - Express response with plant data.
	 * @returns {void}
	 */
	getPlantById = async (req: Request, res: Response) => {
		try {
			const id = Number.parseInt(req.params.id as string);

			if (Number.isNaN(id)) {
				res.status(400).json({ error: "Validation Error", message: "Invalid plant ID" });
				return;
			}

			const plant = await this.service.getPlantById(id);
			const stages = await this.service.getPlantStages(id) as any[];

			res.status(200).json({ success: true, data: toPlantDetail(plant, stages) });
		} catch (error) {
			if ((error as Error).message === "Plant not found") {
				res.status(404).json({ error: "Not Found", message: (error as Error).message });
				return;
			}

			console.error("[PlantController] Error:", error);
			res.status(500).json({ error: "Internal Server Error", message: "Failed to retrieve plant" });
		}
	};

	/**
	 * @description Search plants by name (text input) and/or filters (light, difficulty, indoor/outdoor, sowing month). All parameters are optional and combinable.
	 * @param {Request} req - Express request with query params: q (name search), light, difficulty, is_indoor, sowing_month.
	 * @param {Response} res - Express response with filtered plant list.
	 * @returns {void}
	 */
	searchPlants = async (req: Request, res: Response) => {
		try {
			const { q, light, difficulty, is_indoor, sowing_month, sunlight, care_level } = req.query;

			const query = typeof q === "string" ? q : undefined;
			const filters: { light?: string; difficulty?: string; is_indoor?: boolean; sowingMonth?: number; sunlight?: string; care_level?: string } = {};

			if (typeof light === "string") filters.light = light;
			if (typeof difficulty === "string") filters.difficulty = difficulty;
			if (is_indoor !== undefined) filters.is_indoor = is_indoor === "true";
			if (sowing_month !== undefined) {
				const month = Number.parseInt(sowing_month as string);
				if (!Number.isNaN(month) && month >= 1 && month <= 12) {
					filters.sowingMonth = month;
				}
			}
			if (typeof sunlight === "string") filters.sunlight = sunlight;
			if (typeof care_level === "string") filters.care_level = care_level;

			const plants = await this.service.searchPlants(query, filters);
			const mapped = plants.map(toPlantListItem);

			res.status(200).json({ success: true, count: mapped.length, data: mapped });
		} catch (error) {
			console.error("[PlantController] Error:", error);
			res.status(500).json({ error: "Internal Server Error", message: "Failed to search plants" });
		}
	};

	/**
	 * @description Retrieve all growth stages for a plant, or a specific stage when stage_order is provided.
	 * @param {Request} req - Express request with plant ID as URL parameter and optional stage_order query param.
	 * @param {Response} res - Express response with stage or stages data.
	 * @returns {void}
	 */
	getPlantStages = async (req: Request, res: Response) => {
		try {
			const id = Number.parseInt(req.params.id as string);

			if (Number.isNaN(id)) {
				res.status(400).json({ error: "Validation Error", message: "Invalid plant ID" });
				return;
			}

			const stageOrder = req.query.stage_order ? Number.parseInt(req.query.stage_order as string) : undefined;

			const stages = await this.service.getPlantStages(id, stageOrder);
			const mapped = Array.isArray(stages) ? stages.map(toStageInfo) : toStageInfo(stages);

			res.status(200).json({ success: true, data: mapped });
		} catch (error) {
			const msg = (error as Error).message;
			if (msg.includes("not found")) {
				res.status(404).json({ error: "Not Found", message: msg });
				return;
			}

			console.error("[PlantController] Error:", error);
			res.status(500).json({ error: "Internal Server Error", message: "Failed to retrieve stages" });
		}
	};
}
