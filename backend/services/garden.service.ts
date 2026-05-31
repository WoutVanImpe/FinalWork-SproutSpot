import { db } from "../db/connection";
import { GardenRepository } from "../repositories/garden.repository";
import { UserPlantRepository } from "../repositories/userPlant.repository";
import { UserGardenRecord, ProbeEntryRecord, PlantStageRecord } from "../types/database";
import { enrichPlant, enrichPlants } from "../utils/plantEnricher";

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
	 * @description Retrieve a single enriched plant by its user_plant ID. Verifies the plant belongs to the user's garden.
	 * @param {number} userId - The user's database ID.
	 * @param {number} plantId - The user_plant ID.
	 * @returns {Promise<any>} Enriched plant data.
	 */
	async getUserPlantById(userId: number, plantId: number) {
		const garden = await this.repository.findByUserId(userId);
		if (!garden) {
			throw new Error("Garden not found");
		}

		const rawPlant = await db("user_plants as up")
			.join("plants as p", "up.plant_id", "p.id")
			.leftJoin("probes as pr", "up.sonde_id", "pr.hardware_id")
			.where("up.id", plantId)
			.andWhere("up.garden_id", garden.id)
			.andWhere("up.is_active", true)
			.select(
				"up.id",
				"up.plant_id",
				"up.x_pos",
				"up.y_pos",
				"up.nickname",
				"p.name as plant_name",
				"p.image as plant_image",
				"up.current_stage_order",
				"up.sonde_id",
				"up.created_at",
				"pr.name as probe_name",
				"pr.battery_voltage",
				"pr.wifi_rssi",
				"pr.last_seen",
			)
			.first();

		if (!rawPlant) {
			throw new Error("Plant not found");
		}

		const plantRecord = await db("plants").where("id", rawPlant.plant_id).first();

		const allStages: PlantStageRecord[] = await db("plant_stages")
			.where("plant_id", rawPlant.plant_id)
			.orderBy("stage_order", "asc");

		const currentStage = allStages.find((s) => s.stage_order === rawPlant.current_stage_order) ?? null;

		let latestTelemetry: ProbeEntryRecord | null = null;
		if (rawPlant.sonde_id) {
			const entries = await db("probe_entries")
				.where("sonde_id", rawPlant.sonde_id)
				.orderBy("created_at", "desc")
				.limit(1);
			latestTelemetry = entries[0] ?? null;
		}

		return enrichPlant(
			{ ...rawPlant, water_label: plantRecord?.water ?? "", light_label: plantRecord?.light ?? "", temp_min: plantRecord?.temperature_min, temp_max: plantRecord?.temperature_max },
			currentStage,
			allStages,
			latestTelemetry,
		);
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
