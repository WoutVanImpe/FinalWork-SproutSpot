import { db } from "../db/connection";
import { UserPlantRecord, PlantStageRecord } from "../types/database";
import { CreateUserPlantDto, UpdatePlantStageDto, DeactivatePlantDto } from "../types/dto";

export class UserPlantRepository {
	/**
	 * @description Create a new user plant record with default stage_order of 1 (germination).
	 * @param {CreateUserPlantDto} input - Plant data including user_id, plant_id, garden_id, position coordinates, and optional sonde_id.
	 * @returns {Promise<UserPlantRecord>} The created user plant record.
	 */
	async create(input: CreateUserPlantDto): Promise<UserPlantRecord> {
		const [plant] = await db("user_plants")
			.insert({
				user_id: input.user_id,
				plant_id: input.plant_id,
				nickname: input.nickname,
				garden_id: input.garden_id || null,
				x_pos: input.x_pos,
				y_pos: input.y_pos,
				sonde_id: input.sonde_id || null,
				current_stage_order: 1,
			})
			.returning("*");

		return plant;
	}

	/**
	 * @description Retrieve all user plants for a given user, including inactive ones.
	 * @param {number} userId - The user's database ID.
	 * @returns {Promise<UserPlantRecord[]>} List of plant records ordered newest first.
	 */
	async findByUserId(userId: number): Promise<UserPlantRecord[]> {
		return db("user_plants").where("user_id", userId).orderBy("created_at", "desc");
	}

	/**
	 * @description Retrieve only the currently active (growing) plants for a given user.
	 * @param {number} userId - The user's database ID.
	 * @returns {Promise<UserPlantRecord[]>} List of active plant records where is_active is true.
	 */
	async findActiveByUserId(userId: number): Promise<UserPlantRecord[]> {
		return db("user_plants")
			.where("user_id", userId)
			.andWhere("is_active", true)
			.orderBy("created_at", "desc");
	}

	/**
	 * @description Find a user plant by ID with joined plant details (name, image).
	 * @param {number} id - The user plant's database ID.
	 * @returns {Promise<any>} User plant record with plant_name and plant_image fields, or undefined if not found.
	 */
	async findByIdWithDetails(id: number) {
		return db("user_plants as up")
			.join("plants as p", "up.plant_id", "p.id")
			.where("up.id", id)
			.select(
				"up.*",
				"p.name as plant_name",
				"p.image as plant_image"
			)
			.first();
	}

	/**
	 * @description Update a user plant's current_stage_order and last_stage_update timestamp.
	 * @param {UpdatePlantStageDto} input - Object containing user_plant_id and new_stage_order.
	 * @returns {Promise<UserPlantRecord>} The updated user plant record.
	 */
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

	/**
	 * @description Deactivate a user plant by setting is_active to false and recording the deactivation reason and timestamp.
	 * @param {DeactivatePlantDto} input - Object containing user_plant_id and deactivation reason (harvested, died, removed, reused).
	 * @returns {Promise<UserPlantRecord>} The deactivated user plant record.
	 */
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

	/**
	 * @description Find the next growth stage for a user plant by looking up the stage with the next higher stage_order.
	 * @param {number} userPlantId - The user plant's database ID.
	 * @returns {Promise<PlantStageRecord | undefined>} The next stage record, or undefined if the plant is at its final stage.
	 */
	async getNextStage(userPlantId: number): Promise<PlantStageRecord | undefined> {
		return db("plant_stages as ps")
			.join("user_plants as up", "ps.plant_id", "up.plant_id")
			.where("up.id", userPlantId)
			.andWhere("ps.stage_order", ">", db.raw("up.current_stage_order"))
			.orderBy("ps.stage_order", "asc")
			.select("ps.*")
			.first();
	}

	/**
	 * @description Find the current growth stage for a user plant by matching stage_order.
	 * @param {number} userPlantId - The user plant's database ID.
	 * @returns {Promise<PlantStageRecord | undefined>} The current stage record with care requirements.
	 */
	async getCurrentStage(userPlantId: number): Promise<PlantStageRecord | undefined> {
		return db("plant_stages as ps")
			.join("user_plants as up", "ps.plant_id", "up.plant_id")
			.where("up.id", userPlantId)
			.andWhere("ps.stage_order", "up.current_stage_order")
			.select("ps.*")
			.first();
	}

	async findPlantsReadyForStageAdvancement(): Promise<{ user_plant_id: number; user_id: number; plant_name: string; current_stage_order: number; next_stage_order: number }[]> {
		return db("user_plants as up")
			.join("plant_stages as ps", function () {
				this.on("up.plant_id", "=", "ps.plant_id")
					.andOn("up.current_stage_order", "=", "ps.stage_order");
			})
			.join("plants as p", "up.plant_id", "p.id")
			.joinRaw(
				"INNER JOIN plant_stages AS next ON next.plant_id = up.plant_id AND next.stage_order = up.current_stage_order + 1",
			)
			.where("up.is_active", true)
			.whereRaw("up.last_stage_update + (ps.duration_days || ' days')::INTERVAL <= NOW()")
			.whereNotExists(function () {
				this.select("*")
					.from("pending_notifications")
					.whereRaw("user_plant_id = up.id")
					.where("notification_type", "stage_validation")
					.whereIn("notification_state", ["sent", "snoozed"])
					.whereRaw("created_at > up.last_stage_update");
			})
			.select(
				"up.id as user_plant_id",
				"up.user_id",
				"p.name as plant_name",
				"up.current_stage_order",
				db.raw("next.stage_order as next_stage_order"),
			);
	}
}
