import { db } from "../db/connection";
import { PlantRecord, PlantStageRecord } from "../types/database";

export class PlantRepository {
	/**
	 * @description Retrieve all plants from the encyclopedia, ordered alphabetically by name.
	 * @returns {Promise<PlantRecord[]>} Complete list of plant records.
	 */
	async findAll(): Promise<PlantRecord[]> {
		return db("plants").orderBy("name", "asc");
	}

	/**
	 * @description Find a single plant by its database ID.
	 * @param {number} id - The plant's database ID.
	 * @returns {Promise<PlantRecord | undefined>} The plant record or undefined if not found.
	 */
	async findById(id: number): Promise<PlantRecord | undefined> {
		return db("plants").where("id", id).first();
	}

	/**
	 * @description Search plants by name (free-text) with optional filters. Supports text search on name only, plus exact-match filters for light, difficulty, indoor/outdoor planting type, and sowing month (checks if month is in the sowing_period JSONB array).
	 * @param {string | undefined} nameQuery - Free-text search term matched against plant name only. Undefined skips name filtering.
	 * @param {object} [filters] - Optional filters object with light, difficulty, is_indoor, and sowingMonth properties.
	 * @returns {Promise<PlantRecord[]>} Filtered list of matching plants ordered alphabetically.
	 */
	async search(nameQuery: string | undefined, filters?: { light?: string; difficulty?: string; is_indoor?: boolean; sowingMonth?: number }): Promise<PlantRecord[]> {
		let baseQuery = db("plants");

		if (nameQuery) {
			baseQuery = baseQuery.whereILike("name", `%${nameQuery}%`);
		}

		if (filters?.light) {
			baseQuery = baseQuery.whereILike("light", filters.light);
		}

		if (filters?.difficulty) {
			baseQuery = baseQuery.whereILike("difficulty", filters.difficulty);
		}

		if (filters?.is_indoor !== undefined) {
			baseQuery = baseQuery.where(function () {
				if (filters.is_indoor) {
					this.where("planting_type", "indoor").orWhere("planting_type", "both");
				} else {
					this.where("planting_type", "outdoor").orWhere("planting_type", "both");
				}
			});
		}

		if (filters?.sowingMonth) {
			baseQuery = baseQuery.whereRaw("sowing_period @> ?::jsonb", [JSON.stringify([filters.sowingMonth])]);
		}

		return baseQuery.orderBy("name", "asc");
	}

	/**
	 * @description Retrieve all growth stages for a plant, ordered by stage_order ascending.
	 * @param {number} plantId - The plant's database ID.
	 * @returns {Promise<PlantStageRecord[]>} List of stage records from germination to harvest.
	 */
	async getStagesByPlantId(plantId: number): Promise<PlantStageRecord[]> {
		return db("plant_stages")
			.where("plant_id", plantId)
			.orderBy("stage_order", "asc");
	}

	/**
	 * @description Find a specific growth stage for a plant by its stage order number.
	 * @param {number} plantId - The plant's database ID.
	 * @param {number} stageOrder - The stage order number to find.
	 * @returns {Promise<PlantStageRecord | undefined>} The stage record or undefined if not found.
	 */
	async getStageByPlantAndOrder(plantId: number, stageOrder: number): Promise<PlantStageRecord | undefined> {
		return db("plant_stages")
			.where("plant_id", plantId)
			.andWhere("stage_order", stageOrder)
			.first();
	}
}
