import { db } from "../db/connection";
import { UserGardenRecord } from "../types/database";

export class GardenRepository {
	async create(userId: number): Promise<UserGardenRecord> {
		const [garden] = await db("user_gardens")
			.insert({ user_id: userId })
			.returning("*");

		return garden;
	}

	async findByUserId(userId: number): Promise<UserGardenRecord[]> {
		const gardens = await db("user_gardens")
			.where("user_id", userId)
			.orderBy("created_at", "desc");

		return gardens;
	}

	async findById(id: number): Promise<UserGardenRecord | undefined> {
		const garden = await db("user_gardens").where("id", id).first();
		return garden;
	}

	async findByIdAndUser(id: number, userId: number): Promise<UserGardenRecord | undefined> {
		const garden = await db("user_gardens")
			.where("id", id)
			.andWhere("user_id", userId)
			.first();

		return garden;
	}

	async updateDimensions(gardenId: number, width: number, height: number): Promise<UserGardenRecord> {
		const [garden] = await db("user_gardens")
			.where("id", gardenId)
			.update({ width, height })
			.returning("*");

		return garden;
	}

	async getPlantsInGarden(gardenId: number) {
		const plants = await db("user_plants as up")
			.join("plants as p", "up.plant_id", "p.id")
			.where("up.garden_id", gardenId)
			.andWhere("up.is_active", true)
			.select(
				"up.id as user_plant_id",
				"up.x_pos",
				"up.y_pos",
				"p.name as plant_name",
				"p.image as plant_image",
				"up.current_stage_order",
				"up.is_active"
			);

		return plants;
	}
}
