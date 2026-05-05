import { UserPlantRepository } from "../repositories/userPlant.repository";
import { PlantRepository } from "../repositories/plant.repository";
import { TelemetryRepository } from "../repositories/telemetry.repository";
import { CreateUserPlantDto, UpdatePlantStageDto, DeactivatePlantDto } from "../types/dto";
import { UserPlantRecord } from "../types/database";

export class UserPlantService {
	private repository: UserPlantRepository;
	private plantRepository: PlantRepository;
	private telemetryRepository: TelemetryRepository;

	constructor() {
		this.repository = new UserPlantRepository();
		this.plantRepository = new PlantRepository();
		this.telemetryRepository = new TelemetryRepository();
	}

	async createPlant(input: CreateUserPlantDto): Promise<UserPlantRecord> {
		if (input.garden_id) {
			const isOccupied = await this.repository.isPositionOccupied(
				input.garden_id,
				input.x_pos,
				input.y_pos
			);

			if (isOccupied) {
				throw new Error("This garden position is already occupied");
			}
		}

		const plantExists = await this.plantRepository.findById(input.plant_id);
		if (!plantExists) {
			throw new Error("Plant not found in encyclopedia");
		}

		return this.repository.create(input);
	}

	async getUserPlants(userId: number): Promise<UserPlantRecord[]> {
		return this.repository.findByUserId(userId);
	}

	async getActiveUserPlants(userId: number): Promise<UserPlantRecord[]> {
		return this.repository.findActiveByUserId(userId);
	}

	async getPlantDetails(id: number): Promise<any> {
		const plant = await this.repository.findByIdWithDetails(id);

		if (!plant) {
			throw new Error("Plant not found");
		}

		return plant;
	}

	async advanceStage(input: UpdatePlantStageDto): Promise<UserPlantRecord> {
		const existingPlant = await this.repository.findById(input.user_plant_id);

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

		return this.repository.updateStage(input);
	}

	async deactivatePlant(input: DeactivatePlantDto): Promise<UserPlantRecord> {
		const existingPlant = await this.repository.findById(input.user_plant_id);

		if (!existingPlant) {
			throw new Error("Plant not found");
		}

		if (!existingPlant.is_active) {
			throw new Error("Plant is already inactive");
		}

		return this.repository.deactivate(input);
	}

	async calculateMatchPercentage(userId: number, plantId: number): Promise<number> {
		const plant = await this.plantRepository.findById(plantId);
		if (!plant) {
			throw new Error("Plant not found in encyclopedia");
		}

		const userPlants = await this.repository.findActiveByUserId(userId);
		const telemetryData = await this.getAverageTelemetryForUserPlants(userPlants);

		let score = 0;
		let factors = 0;

		const difficultyWeights: Record<string, number> = {
			easy: 1.0,
			medium: 0.7,
			hard: 0.4,
		};

		const difficultyWeight = difficultyWeights[plant.difficulty.toLowerCase()] || 0.5;
		score += difficultyWeight * 25;
		factors += 25;

		if (telemetryData.avgTemp !== null) {
			const tempRange = this.parseRange(plant.temperature);
			if (tempRange) {
				const tempScore = this.calculateRangeScore(telemetryData.avgTemp, tempRange.min, tempRange.max);
				score += tempScore * 25;
				factors += 25;
			}
		}

		if (telemetryData.avgLight !== null) {
			const lightLevel = this.mapLightLevel(telemetryData.avgLight);
			const lightMatch = lightLevel === plant.light.toLowerCase() ? 1.0 : 0.3;
			score += lightMatch * 25;
			factors += 25;
		}

		score += 25;
		factors += 25;

		return factors > 0 ? Math.round((score / factors) * 100) : 50;
	}

	async movePlant(userPlantId: number, gardenId: number, x_pos: number, y_pos: number): Promise<UserPlantRecord> {
		const plant = await this.repository.findById(userPlantId);

		if (!plant) {
			throw new Error("Plant not found");
		}

		const isOccupied = await this.repository.isPositionOccupied(gardenId, x_pos, y_pos, userPlantId);

		if (isOccupied) {
			throw new Error("This garden position is already occupied");
		}

		return this.repository.updatePosition(userPlantId, x_pos, y_pos);
	}

	private async getAverageTelemetryForUserPlants(userPlants: UserPlantRecord[]) {
		let totalTemp = 0;
		let tempCount = 0;
		let totalLight = 0;
		let lightCount = 0;

		for (const plant of userPlants) {
			if (!plant.sonde_id) continue;

			const entries = await this.telemetryRepository.getRecentEntriesBySondeId(plant.sonde_id, 24);

			for (const entry of entries) {
				if (entry.temp_c !== null && entry.temp_c !== undefined) {
					totalTemp += entry.temp_c;
					tempCount++;
				}
				if (entry.light_lux !== null && entry.light_lux !== undefined) {
					totalLight += entry.light_lux;
					lightCount++;
				}
			}
		}

		return {
			avgTemp: tempCount > 0 ? totalTemp / tempCount : null,
			avgLight: lightCount > 0 ? totalLight / lightCount : null,
		};
	}

	private parseRange(rangeStr: string): { min: number; max: number } | null {
		const match = rangeStr.match(/(\d+)\s*[-–to]+\s*(\d+)/);
		if (match && match[1] && match[2]) {
			return { min: parseInt(match[1]), max: parseInt(match[2]) };
		}
		return null;
	}

	private calculateRangeScore(value: number, min: number, max: number): number {
		if (value >= min && value <= max) return 1.0;

		const range = max - min;
		const distance = value < min ? min - value : value - max;
		const penalty = Math.min(distance / range, 1);

		return 1 - penalty;
	}

	private mapLightLevel(lux: number): string {
		if (lux < 1000) return "low";
		if (lux < 10000) return "medium";
		return "high";
	}
}
