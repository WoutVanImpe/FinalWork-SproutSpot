import { UserRepository } from "../repositories/user.repository";
import { UserRecord } from "../types/database";
import { CreateUserDto, UpdateProfileDto } from "../types/dto";

export class UserService {
	private repository: UserRepository;

	constructor() {
		this.repository = new UserRepository();
	}

	/**
	 * @description Register a new user after verifying the email is not already taken.
	 * @param {CreateUserDto} input - User registration data containing name, email, and password.
	 * @returns {Promise<UserRecord>} The created user record.
	 */
	async signup(input: CreateUserDto): Promise<UserRecord> {
		const existingUser = await this.repository.findByEmail(input.email);

		if (existingUser) {
			throw new Error("Email already registered");
		}

		return this.repository.create(input);
	}

	/**
	 * @description Authenticate a user by verifying email and password match.
	 * @param {string} email - User's email address.
	 * @param {string} password - User's plaintext password (bcrypt hashing pending).
	 * @returns {Promise<UserRecord>} The authenticated user record.
	 */
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

	/**
	 * @description Retrieve a user's full profile by their ID.
	 * @param {number} userId - The user's database ID.
	 * @returns {Promise<UserRecord>} The user record.
	 */
	async getProfile(userId: number): Promise<UserRecord> {
		const user = await this.repository.findById(userId);

		if (!user) {
			throw new Error("User not found");
		}

		return user;
	}

	/**
	 * @description Update a user's profile fields (name, profile picture, push token, notification window).
	 * @param {number} userId - The user's database ID.
	 * @param {UpdateProfileDto} input - Fields to update on the user profile.
	 * @returns {Promise<UserRecord>} The updated user record.
	 */
	async updateProfile(userId: number, input: UpdateProfileDto): Promise<UserRecord> {
		const existingUser = await this.repository.findById(userId);

		if (!existingUser) {
			throw new Error("User not found");
		}

		return this.repository.updateProfile(userId, input);
	}

	/**
	 * @description Change a user's password after verifying the current password is correct.
	 * @param {number} userId - The user's database ID.
	 * @param {string} currentPassword - The user's current password for verification.
	 * @param {string} newPassword - The new password to set.
	 * @returns {Promise<UserRecord>} The updated user record.
	 */
	async updatePassword(userId: number, currentPassword: string, newPassword: string): Promise<UserRecord> {
		const user = await this.repository.findById(userId);

		if (!user) {
			throw new Error("User not found");
		}

		if (user.password_hash !== currentPassword) {
			throw new Error("Current password is incorrect");
		}

		return this.repository.updatePassword(userId, newPassword);
	}

	/**
	 * @description Store or update the user's push notification token for mobile alerts.
	 * @param {number} userId - The user's database ID.
	 * @param {string} pushToken - The FCM/APNs device token.
	 * @returns {Promise<void>}
	 */
	async updatePushToken(userId: number, pushToken: string): Promise<void> {
		await this.repository.updatePushToken(userId, pushToken);
	}
}
