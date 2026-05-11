import { PlantRepository } from "../repositories/plant.repository";
import { PlantRecord, PlantStageRecord } from "../types/database";

export class PlantService {
	private repository: PlantRepository;

	constructor() {
		this.repository = new PlantRepository();
	}

	/**
	 * @description Retrieve all plants from the encyclopedia, ordered alphabetically by name.
	 * @returns {Promise<PlantRecord[]>} Complete list of plant records.
	 */
	async getAllPlants(): Promise<PlantRecord[]> {
		return this.repository.findAll();
	}

	/**
	 * @description Retrieve a single plant from the encyclopedia by its database ID.
	 * @param {number} id - The plant's database ID.
	 * @returns {Promise<PlantRecord>} The plant record with full details.
	 */
	async getPlantById(id: number): Promise<PlantRecord> {
		const plant = await this.repository.findById(id);

		if (!plant) {
			throw new Error("Plant not found");
		}

		return plant;
	}

	/**
	 * @description Search plants by name (free-text) with optional filters for light requirements, difficulty level, indoor/outdoor planting type, and sowing month.
	 * @param {string | undefined} nameQuery - Free-text search term matched against plant name only. Undefined skips name filtering.
	 * @param {object} [filters] - Optional filters object with light, difficulty, is_indoor, and sowingMonth properties.
	 * @returns {Promise<PlantRecord[]>} Filtered list of matching plants.
	 */
	async searchPlants(nameQuery: string | undefined, filters?: { light?: string; difficulty?: string; is_indoor?: boolean; sowingMonth?: number }): Promise<PlantRecord[]> {
		return this.repository.search(nameQuery, filters);
	}

	/**
	 * @description Retrieve growth stages for a plant. Returns all stages or a specific stage when stageOrder is provided.
	 * @param {number} plantId - The plant's database ID.
	 * @param {number} [stageOrder] - Optional stage order number to retrieve a single stage.
	 * @returns {Promise<PlantStageRecord | PlantStageRecord[]>} Single stage record or array of all stages ordered by stage_order.
	 */
	async getPlantStages(plantId: number, stageOrder?: number): Promise<PlantStageRecord | PlantStageRecord[]> {
		const plant = await this.repository.findById(plantId);

		if (!plant) {
			throw new Error("Plant not found");
		}

		if (stageOrder !== undefined) {
			const stage = await this.repository.getStageByPlantAndOrder(plantId, stageOrder);

			if (!stage) {
				throw new Error(`Stage ${stageOrder} not found for this plant`);
			}

			return stage;
		}

		return this.repository.getStagesByPlantId(plantId);
	}

	/**
	 * @description Check if a target month falls within any of the plant's sowing periods. Handles both numeric months and string-formatted periods like "month 3" or "3-5".
	 * @param {(number | string)[]} sowingPeriod - Array of month numbers or period strings from the plant record.
	 * @param {number} targetMonth - Month number (1-12) to check against.
	 * @returns {boolean} True if the target month matches any sowing period.
	 */
	checkSowingPeriod(sowingPeriod: (number | string)[], targetMonth: number): boolean {
		return sowingPeriod.some((period) => {
			if (typeof period === "number") {
				return period === targetMonth;
			}
			const match = period.match(/(\d+)/);
			if (match && match[1]) {
				return parseInt(match[1]) === targetMonth;
			}
			return false;
		});
	}
}
