import { GardenRepository } from "../repositories/garden.repository";
import { UserGardenRecord } from "../types/database";

export class GardenService {
	private repository: GardenRepository;

	constructor() {
		this.repository = new GardenRepository();
	}

	async createGarden(userId: number): Promise<UserGardenRecord> {
		return this.repository.create(userId);
	}

	async getUserGardens(userId: number): Promise<UserGardenRecord[]> {
		const gardens = await this.repository.findByUserId(userId);

		if (gardens.length === 0) {
			const defaultGarden = await this.repository.create(userId);
			return [defaultGarden];
		}

		return gardens;
	}

	async getGardenDetails(gardenId: number, userId: number): Promise<any> {
		const garden = await this.repository.findByIdAndUser(gardenId, userId);

		if (!garden) {
			throw new Error("Garden not found");
		}

		const plants = await this.repository.getPlantsInGarden(gardenId);

		return {
			garden,
			plants,
		};
	}

	async updateDimensions(gardenId: number, userId: number, width: number, height: number): Promise<UserGardenRecord> {
		const garden = await this.repository.findByIdAndUser(gardenId, userId);

		if (!garden) {
			throw new Error("Garden not found");
		}

		if (width < 1 || height < 1 || width > 50 || height > 50) {
			throw new Error("Dimensions must be between 1 and 50");
		}

		return this.repository.updateDimensions(gardenId, width, height);
	}
}
