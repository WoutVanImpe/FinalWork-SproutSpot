import { UserRepository } from "../repositories/user.repository";
import { UserRecord } from "../types/database";
import { CreateUserDto, UpdateProfileDto } from "../types/dto";

export class UserService {
	private repository: UserRepository;

	constructor() {
		this.repository = new UserRepository();
	}

	async signup(input: CreateUserDto): Promise<UserRecord> {
		const existingUser = await this.repository.findByEmail(input.email);

		if (existingUser) {
			throw new Error("Email already registered");
		}

		/* TODO: Hash password with bcrypt before storing
		 * For now, password is stored as-is for development
		 */
		return this.repository.create(input);
	}

	async login(email: string, password: string): Promise<UserRecord> {
		const user = await this.repository.findByEmail(email);

		if (!user) {
			throw new Error("Invalid email or password");
		}

		if (user.password_hash !== password) {
			throw new Error("Invalid email or password");
		}

		return user;
	}

	async getProfile(userId: number): Promise<UserRecord> {
		const user = await this.repository.findById(userId);

		if (!user) {
			throw new Error("User not found");
		}

		return user;
	}

	async updateProfile(userId: number, input: UpdateProfileDto): Promise<UserRecord> {
		const existingUser = await this.repository.findById(userId);

		if (!existingUser) {
			throw new Error("User not found");
		}

		return this.repository.updateProfile(userId, input);
	}

	async updatePassword(userId: number, currentPassword: string, newPassword: string): Promise<UserRecord> {
		const user = await this.repository.findById(userId);

		if (!user) {
			throw new Error("User not found");
		}

		if (user.password_hash !== currentPassword) {
			throw new Error("Current password is incorrect");
		}

		/* TODO: Hash new password with bcrypt before storing */
		return this.repository.updatePassword(userId, newPassword);
	}

	async updatePushToken(userId: number, pushToken: string): Promise<void> {
		await this.repository.updatePushToken(userId, pushToken);
	}
}
