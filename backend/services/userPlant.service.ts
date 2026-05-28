import { UserPlantRepository } from "../repositories/userPlant.repository";
import { GardenRepository } from "../repositories/garden.repository";
import { PlantRepository } from "../repositories/plant.repository";
import { TelemetryRepository } from "../repositories/telemetry.repository";
import { CreateUserPlantDto, UpdatePlantStageDto, DeactivatePlantDto } from "../types/dto";
import { UserPlantRecord, PlantStageRecord, ProbeEntryRecord } from "../types/database";

export class UserPlantService {
	private repository: UserPlantRepository;
	private gardenRepository: GardenRepository;
	private plantRepository: PlantRepository;
	private telemetryRepository: TelemetryRepository;

	constructor() {
		this.repository = new UserPlantRepository();
		this.gardenRepository = new GardenRepository();
		this.plantRepository = new PlantRepository();
		this.telemetryRepository = new TelemetryRepository();
	}

	/**
	 * @description Retrieve all user plants for a given user, including both active and inactive (harvested/died/removed) plants.
	 * @param {number} userId - The user's database ID.
	 * @returns {Promise<UserPlantRecord[]>} List of all plant records ordered newest first.
	 */
	async getAllUserPlants(userId: number): Promise<UserPlantRecord[]> {
		return this.repository.findByUserId(userId);
	}

	/**
	 * @description Retrieve only the currently active (growing) plants for a given user.
	 * @param {number} userId - The user's database ID.
	 * @returns {Promise<UserPlantRecord[]>} List of active plant records ordered newest first.
	 */
	async getAllActiveUserPlants(userId: number): Promise<UserPlantRecord[]> {
		return this.repository.findActiveByUserId(userId);
	}

	/**
	 * @description Advance a user plant to the next growth stage. Validates the plant is active and the requested stage_order matches the next expected stage in the sequence.
	 * @param {UpdatePlantStageDto} input - Object containing user_plant_id and the new_stage_order to advance to.
	 * @returns {Promise<{ plant: UserPlantRecord; stage: PlantStageRecord }>} Updated plant record and the new stage's care requirements.
	 */
	async updateStage(input: UpdatePlantStageDto): Promise<{ plant: UserPlantRecord; stage: PlantStageRecord }> {
		const existingPlant = await this.repository.findByIdWithDetails(input.user_plant_id);

		if (!existingPlant) {
			throw new Error("Plant not found");
		}

		if (!existingPlant.is_active) {
			throw new Error("Cannot update stage for inactive plant");
		}

		const nextStage = await this.repository.getNextStage(input.user_plant_id);

		if (!nextStage) {
			throw new Error("No next stage available - plant is at final growth stage");
		}

		if (input.new_stage_order !== nextStage.stage_order) {
			throw new Error(`Invalid stage order. Expected ${nextStage.stage_order}, got ${input.new_stage_order}`);
		}

		const plant = await this.repository.updateStage(input);

		return { plant, stage: nextStage };
	}

	/**
	 * @description Create a new user plant record (add a plant to the user's garden).
	 * @param {CreateUserPlantDto} input - The plant creation data including user_id, plant_id, nickname, position, and optional garden/probe.
	 * @returns {Promise<UserPlantRecord>} The created user plant record.
	 */
	async createUserPlant(input: CreateUserPlantDto): Promise<UserPlantRecord> {
		if (!input.garden_id) {
			const garden = await this.gardenRepository.getOrCreate(input.user_id);
			input.garden_id = garden.id;
		}
		const createdPlant = await this.repository.create(input);
		return createdPlant;
	}

	/**
	 * @description Retrieve the current growth stage details for a user plant.
	 * @param {number} userPlantId - The user plant's database ID.
	 * @returns {Promise<PlantStageRecord>} The current stage record with care requirements.
	 */
	async getCurrentStage(userPlantId: number): Promise<PlantStageRecord> {
		const stage = await this.repository.getCurrentStage(userPlantId);

		if (!stage) {
			throw new Error("No current stage found for this plant");
		}

		return stage;
	}

	/**
	 * @description Retrieve the latest telemetry readings from the probe linked to a user plant. Throws if no probe is linked.
	 * @param {number} userPlantId - The user plant's database ID.
	 * @param {number} [limit=24] - Maximum number of readings to return.
	 * @returns {Promise<ProbeEntryRecord[]>} List of recent sensor readings from the linked probe.
	 */
	async getLastReadings(userPlantId: number, limit: number = 24, hours?: number): Promise<ProbeEntryRecord[]> {
		const plant = await this.repository.findByIdWithDetails(userPlantId);

		if (!plant) {
			throw new Error("Plant not found");
		}

		if (!plant.sonde_id) {
			throw new Error("No probe linked to this plant");
		}

		if (hours) {
			return this.telemetryRepository.getRecentEntriesBySondeIdInRange(plant.sonde_id, hours);
		}

		return this.telemetryRepository.getRecentEntriesBySondeId(plant.sonde_id, limit);
	}
}
