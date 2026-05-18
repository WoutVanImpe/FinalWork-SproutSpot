import { db } from "../db/connection";
import { UserGardenRecord } from "../types/database";

interface PlantPositionUpdate {
	id: number;
	x_pos: number;
	y_pos: number;
}

export class GardenRepository {
	/**
	 * @description Retrieve a user's garden or create one with default dimensions if none exists.
	 * @param {number} userId - The user's database ID.
	 * @returns {Promise<UserGardenRecord>} The existing or newly created garden record.
	 */
	async getOrCreate(userId: number): Promise<UserGardenRecord> {
		const garden = await db("user_gardens").where("user_id", userId).first();

		if (garden) {
			return garden;
		}

		const [created] = await db("user_gardens")
			.insert({ user_id: userId })
			.returning("*");

		return created;
	}

	/**
	 * @description Find a user's garden by their user ID.
	 * @param {number} userId - The user's database ID.
	 * @returns {Promise<UserGardenRecord | undefined>} The garden record or undefined if not found.
	 */
	async findByUserId(userId: number): Promise<UserGardenRecord | undefined> {
		return db("user_gardens").where("user_id", userId).first();
	}

	/**
	 * @description Retrieve a user's garden along with all active plants in it, including linked probe health data (battery, WiFi, last_seen).
	 * @param {number} userId - The user's database ID.
	 * @returns {Promise<{ garden: UserGardenRecord; plants: any[] } | null>} Garden record and plant list, or null if no garden exists.
	 */
	async getGardenWithActivePlants(userId: number) {
		const garden = await db("user_gardens")
			.where("user_id", userId)
			.first();

		if (!garden) {
			return null;
		}

		const plants = await db("user_plants as up")
			.join("plants as p", "up.plant_id", "p.id")
			.leftJoin("probes as pr", "up.sonde_id", "pr.hardware_id")
			.where("up.garden_id", garden.id)
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
				"pr.battery_voltage",
				"pr.wifi_rssi",
				"pr.last_seen"
			);

		return { garden, plants };
	}

	/**
	 * @description Update a garden's width and height dimensions.
	 * @param {number} gardenId - The garden's database ID.
	 * @param {number} width - New width value (1-50 range).
	 * @param {number} height - New height value (1-50 range).
	 * @returns {Promise<UserGardenRecord>} The updated garden record.
	 */
	async updateDimensions(gardenId: number, width: number, height: number): Promise<UserGardenRecord> {
		const [garden] = await db("user_gardens")
			.where("id", gardenId)
			.update({ width, height })
			.returning("*");

		return garden;
	}

	/**
	 * @description Update the grid positions of multiple plants in a batch. Each update sets the x_pos and y_pos for a plant by its ID.
	 * @param {PlantPositionUpdate[]} updates - Array of objects containing plant id, x_pos, and y_pos.
	 * @returns {Promise<void>}
	 */
	async updatePlantPositions(updates: PlantPositionUpdate[]): Promise<void> {
		if (updates.length === 0) return;

		for (const update of updates) {
			await db("user_plants")
				.where("id", update.id)
				.update({ x_pos: update.x_pos, y_pos: update.y_pos });
		}
	}
}
