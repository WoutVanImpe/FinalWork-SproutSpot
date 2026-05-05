import { db } from "../db/connection";
import { PlantRecord, PlantStageRecord } from "../types/database";

export class PlantRepository {
	async findAll(): Promise<PlantRecord[]> {
		const plants = await db("plants").orderBy("name", "asc");
		return plants;
	}

	async findById(id: number): Promise<PlantRecord | undefined> {
		const plant = await db("plants").where("id", id).first();
		return plant;
	}

	async search(query: string): Promise<PlantRecord[]> {
		const plants = await db("plants")
			.whereILike("name", `%${query}%`)
			.orWhereILike("difficulty", `%${query}%`)
			.orderBy("name", "asc");

		return plants;
	}

	async getStagesByPlantId(plantId: number): Promise<PlantStageRecord[]> {
		const stages = await db("plant_stages")
			.where("plant_id", plantId)
			.orderBy("stage_order", "asc");

		return stages;
	}

	async getStageByPlantAndOrder(plantId: number, stageOrder: number): Promise<PlantStageRecord | undefined> {
		const stage = await db("plant_stages")
			.where("plant_id", plantId)
			.andWhere("stage_order", stageOrder)
			.first();

		return stage;
	}
}
