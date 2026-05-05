import { db } from "../db/connection";
import { UserPlantRecord } from "../types/database";
import { CreateUserPlantDto, UpdatePlantStageDto, DeactivatePlantDto } from "../types/dto";

export class UserPlantRepository {
	async create(input: CreateUserPlantDto): Promise<UserPlantRecord> {
		const [plant] = await db("user_plants")
			.insert({
				user_id: input.user_id,
				plant_id: input.plant_id,
				garden_id: input.garden_id || null,
				x_pos: input.x_pos,
				y_pos: input.y_pos,
				sonde_id: input.sonde_id || null,
				current_stage_order: 1,
			})
			.returning("*");

		return plant;
	}

	async findById(id: number): Promise<UserPlantRecord | undefined> {
		const plant = await db("user_plants").where("id", id).first();
		return plant;
	}

	async findByUserId(userId: number): Promise<UserPlantRecord[]> {
		const plants = await db("user_plants")
			.where("user_id", userId)
			.orderBy("created_at", "desc");
		return plants;
	}

	async findActiveByUserId(userId: number): Promise<UserPlantRecord[]> {
		const plants = await db("user_plants")
			.where("user_id", userId)
			.andWhere("is_active", true)
			.orderBy("created_at", "desc");
		return plants;
	}

	async findByIdWithDetails(id: number) {
		const plant = await db("user_plants as up")
			.join("plants as p", "up.plant_id", "p.id")
			.leftJoin("plant_stages as ps", function () {
				this.on("ps.plant_id", "up.plant_id").andOn("ps.stage_order", "up.current_stage_order");
			})
			.where("up.id", id)
			.select(
				"up.*",
				"p.name as plant_name",
				"p.image as plant_image",
				"ps.stage_name",
				"ps.thresholds",
				"ps.validation_description",
				"ps.instructions"
			)
			.first();

		return plant;
	}

	async updateStage(input: UpdatePlantStageDto): Promise<UserPlantRecord> {
		const [plant] = await db("user_plants")
			.where("id", input.user_plant_id)
			.update({
				current_stage_order: input.new_stage_order,
				last_stage_update: db.fn.now(),
			})
			.returning("*");

		return plant;
	}

	async deactivate(input: DeactivatePlantDto): Promise<UserPlantRecord> {
		const [plant] = await db("user_plants")
			.where("id", input.user_plant_id)
			.update({
				is_active: false,
				deactivation_reason: input.reason,
				deactivated_at: db.fn.now(),
			})
			.returning("*");

		return plant;
	}

	async getNextStage(userPlantId: number) {
		const nextStage = await db("plant_stages as ps")
			.join("user_plants as up", "ps.plant_id", "up.plant_id")
			.where("up.id", userPlantId)
			.andWhere("ps.stage_order", ">", db.raw("up.current_stage_order"))
			.orderBy("ps.stage_order", "asc")
			.select("ps.*")
			.first();

		return nextStage;
	}

	async isPositionOccupied(gardenId: number, x_pos: number, y_pos: number, excludePlantId?: number): Promise<boolean> {
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

	async updatePosition(userPlantId: number, x_pos: number, y_pos: number): Promise<UserPlantRecord> {
		const [plant] = await db("user_plants")
			.where("id", userPlantId)
			.update({ x_pos, y_pos })
			.returning("*");

		return plant;
	}

	async linkProbe(userPlantId: number, sondeId: string): Promise<UserPlantRecord> {
		const [plant] = await db("user_plants")
			.where("id", userPlantId)
			.update({ sonde_id: sondeId })
			.returning("*");

		return plant;
	}
}
