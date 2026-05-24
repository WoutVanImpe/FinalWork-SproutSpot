import bcrypt from "bcrypt";
import { UserRepository } from "../repositories/user.repository";
import { GardenRepository } from "../repositories/garden.repository";
import { UserRecord } from "../types/database";
import { CreateUserDto, UpdateProfileDto } from "../types/dto";

export class UserService {
	private repository: UserRepository;
	private gardenRepository: GardenRepository;

	constructor() {
		this.repository = new UserRepository();
		this.gardenRepository = new GardenRepository();
	}

	/**
	 * @description Generate a raw pairing code in format XX###### (2 uppercase letters + 6 digits).
	 * @returns {string} A random pairing code string.
	 */
	private generatePairingCode(): string {
		const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
		const digits = "0123456789";
		let code = "";
		for (let i = 0; i < 2; i++) {
			code += letters[Math.floor(Math.random() * letters.length)];
		}
		for (let i = 0; i < 6; i++) {
			code += digits[Math.floor(Math.random() * digits.length)];
		}
		return code;
	}

	/**
	 * @description Generate a unique pairing code by retrying until no database collision is found.
	 * @returns {Promise<string>} A unique pairing code not used by any other user.
	 */
	private async generateUniquePairingCode(): Promise<string> {
		let code: string;
		let existing: UserRecord | undefined;
		do {
			code = this.generatePairingCode();
			existing = await this.repository.findByPairingCode(code);
		} while (existing);
		return code;
	}

	/**
	 * @description Register a new user after verifying the email is not already taken. Auto-generates a unique hardware pairing code. Hashes the password with bcrypt.
	 * @param {CreateUserDto} input - User registration data containing name, email, and password.
	 * @returns {Promise<UserRecord>} The created user record with a pairing_code for probe registration.
	 */
	async signup(input: CreateUserDto): Promise<UserRecord> {
		const existingUser = await this.repository.findByEmail(input.email);

		if (existingUser) {
			throw new Error("Email already registered");
		}

		const hashedPassword = await bcrypt.hash(input.password, 10);
		const pairingCode = await this.generateUniquePairingCode();

		const user = await this.repository.create({ ...input, password: hashedPassword }, pairingCode);

		await this.gardenRepository.getOrCreate(user.id);

		return user;
	}

	/**
	 * @description Authenticate a user by verifying email and password with bcrypt.
	 * @param {string} email - User's email address.
	 * @param {string} password - User's plaintext password.
	 * @returns {Promise<UserRecord>} The authenticated user record.
	 */
	async login(email: string, password: string): Promise<UserRecord> {
		const user = await this.repository.findByEmail(email);

		if (!user) {
			throw new Error("Invalid email or password");
		}

		const passwordValid = await bcrypt.compare(password, user.password_hash);

		if (!passwordValid) {
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
	/**
	 * @description Look up a user by their hardware pairing code.
	 * @param {string} pairingCode - The pairing code to search for.
	 * @returns {Promise<UserRecord | undefined>} The user record or undefined if not found.
	 */
	async findByPairingCode(pairingCode: string): Promise<UserRecord | undefined> {
		return this.repository.findByPairingCode(pairingCode);
	}

	/**
	 * @description Rotate a user's pairing code to a new unique value (called after successful probe registration).
	 * @param {number} userId - The user's database ID.
	 * @returns {Promise<string>} The newly generated pairing code.
	 */
	async regeneratePairingCode(userId: number): Promise<string> {
		const newCode = await this.generateUniquePairingCode();
		await this.repository.updatePairingCode(userId, newCode);
		return newCode;
	}

	async updatePassword(userId: number, currentPassword: string, newPassword: string): Promise<UserRecord> {
		const user = await this.repository.findById(userId);

		if (!user) {
			throw new Error("User not found");
		}

		const passwordValid = await bcrypt.compare(currentPassword, user.password_hash);

		if (!passwordValid) {
			throw new Error("Current password is incorrect");
		}

		const hashedPassword = await bcrypt.hash(newPassword, 10);

		return this.repository.updatePassword(userId, hashedPassword);
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
