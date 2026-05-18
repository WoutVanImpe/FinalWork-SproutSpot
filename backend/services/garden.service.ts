import { db } from "../db/connection";
import { GardenRepository } from "../repositories/garden.repository";
import { UserPlantRepository } from "../repositories/userPlant.repository";
import { UserGardenRecord } from "../types/database";
import { enrichPlants } from "../utils/plantEnricher";

interface GardenUpdateInput {
	width?: number;
	height?: number;
	plant_positions?: Array<{ id: number; x_pos: number; y_pos: number }>;
}

export class GardenService {
	private repository: GardenRepository;

	constructor() {
		this.repository = new GardenRepository();
	}

	/**
	 * @description Retrieve the user's garden and all active plants within it. Auto-creates an empty garden if none exists.
	 * @param {number} userId - The user's database ID.
	 * @returns {Promise<{ garden: UserGardenRecord; plants: any[] }>} Garden record and list of active plants with probe health info.
	 */
	async getUserGarden(userId: number) {
		const result = await this.repository.getGardenWithActivePlants(userId);

		if (!result) {
			const garden = await this.repository.getOrCreate(userId);
			return { garden, plants: [] };
		}

		const enrichedPlants = await enrichPlants(result.plants);

		return { garden: result.garden, plants: enrichedPlants };
	}

	/**
	 * @description Retrieve a rich dashboard view including garden, active plants, and each plant's current stage details.
	 * @param {number} userId - The user's database ID.
	 * @returns {Promise<any>} Dashboard data with garden, enriched plants, and summary stats.
	 */
	async getUserDashboard(userId: number) {
		const result = await this.repository.getGardenWithActivePlants(userId);

		if (!result) {
			const garden = await this.repository.getOrCreate(userId);
			return {
				garden,
				plants: [],
				stats: { total_plants: 0, active_plants: 0 },
			};
		}

		const enrichedPlants = await enrichPlants(result.plants);

		return {
			garden: result.garden,
			plants: enrichedPlants,
			stats: {
				total_plants: enrichedPlants.length,
				active_plants: enrichedPlants.filter((p: any) => p.warning !== undefined).length,
			},
		};
	}

	/**
	 * @description Update garden dimensions (validated 1-50 range) and/or plant positions. Checks for position collisions before applying.
	 * @param {number} userId - The user's database ID.
	 * @param {GardenUpdateInput} input - Optional width, height, and/or array of plant position updates.
	 * @returns {Promise<UserGardenRecord>} The updated garden record.
	 */
	async updateGarden(userId: number, input: GardenUpdateInput): Promise<UserGardenRecord> {
		const garden = await this.repository.findByUserId(userId);

		if (!garden) {
			throw new Error("Garden not found");
		}

		if (input.width !== undefined || input.height !== undefined) {
			const newWidth = input.width ?? garden.width;
			const newHeight = input.height ?? garden.height;

			if (newWidth < 1 || newHeight < 1 || newWidth > 50 || newHeight > 50) {
				throw new Error("Dimensions must be between 1 and 50");
			}

			await this.repository.updateDimensions(garden.id, newWidth, newHeight);
		}

		if (input.plant_positions && input.plant_positions.length > 0) {
			for (const pos of input.plant_positions) {
				const isOccupied = await this.isPositionOccupied(garden.id, pos.x_pos, pos.y_pos, pos.id);

				if (isOccupied) {
					throw new Error(`Position (${pos.x_pos}, ${pos.y_pos}) is already occupied`);
				}
			}

			await this.repository.updatePlantPositions(input.plant_positions);
		}

		const updatedGarden = await this.repository.findByUserId(userId);
		return updatedGarden!;
	}

	/**
	 * @description Check if a grid position in the garden is occupied by an active plant, optionally excluding a specific plant.
	 * @param {number} gardenId - The garden's database ID.
	 * @param {number} x_pos - X coordinate on the garden grid.
	 * @param {number} y_pos - Y coordinate on the garden grid.
	 * @param {number} [excludePlantId] - Optional plant ID to exclude from the check (useful when moving the same plant).
	 * @returns {Promise<boolean>} True if the position is occupied by another active plant.
	 */
	private async isPositionOccupied(gardenId: number, x_pos: number, y_pos: number, excludePlantId?: number): Promise<boolean> {
		const query = db("user_plants")
			.where("garden_id", gardenId)
			.andWhere("x_pos", x_pos)
			.andWhere("y_pos", y_pos)
			.andWhere("is_active", true);

		if (excludePlantId) {
			query.andWhereNot("id", excludePlantId);
		}

		const result = await query.first();
		return !!result;
	}
}
