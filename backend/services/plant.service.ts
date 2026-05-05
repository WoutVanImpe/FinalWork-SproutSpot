import { PlantRepository } from "../repositories/plant.repository";
import { PlantRecord, PlantStageRecord } from "../types/database";

export class PlantService {
	private repository: PlantRepository;

	constructor() {
		this.repository = new PlantRepository();
	}

	async getAllPlants(): Promise<PlantRecord[]> {
		return this.repository.findAll();
	}

	async getPlantById(id: number): Promise<PlantRecord> {
		const plant = await this.repository.findById(id);

		if (!plant) {
			throw new Error("Plant not found in encyclopedia");
		}

		return plant;
	}

	async searchPlants(query: string): Promise<PlantRecord[]> {
		return this.repository.search(query);
	}

	async getPlantStages(plantId: number): Promise<PlantStageRecord[]> {
		const plant = await this.repository.findById(plantId);

		if (!plant) {
			throw new Error("Plant not found in encyclopedia");
		}

		return this.repository.getStagesByPlantId(plantId);
	}

	async getPlantStage(plantId: number, stageOrder: number): Promise<PlantStageRecord> {
		const stage = await this.repository.getStageByPlantAndOrder(plantId, stageOrder);

		if (!stage) {
			throw new Error("Stage not found for this plant");
		}

		return stage;
	}
}
