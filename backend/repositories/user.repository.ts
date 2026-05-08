import { db } from "../db/connection";
import { UserRecord } from "../types/database";
import { CreateUserDto, UpdateProfileDto } from "../types/dto";

export class UserRepository {
	/**
	 * @description Create a new user record in the database with an auto-generated pairing code.
	 * @param {CreateUserDto} input - User data containing name, email, and password_hash.
	 * @param {string} pairingCode - The initial hardware pairing code (2 letters + 6 digits).
	 * @returns {Promise<UserRecord>} The created user record.
	 */
	async create(input: CreateUserDto, pairingCode: string): Promise<UserRecord> {
		const [user] = await db("users")
			.insert({
				name: input.name,
				email: input.email,
				password_hash: input.password,
				pairing_code: pairingCode,
			})
			.returning("*");

		return user;
	}

	/**
	 * @description Find a user by their email address.
	 * @param {string} email - The user's email address.
	 * @returns {Promise<UserRecord | undefined>} The user record or undefined if not found.
	 */
	async findByEmail(email: string): Promise<UserRecord | undefined> {
		return db("users").where("email", email).first();
	}

	/**
	 * @description Find a user by their database ID.
	 * @param {number} id - The user's database ID.
	 * @returns {Promise<UserRecord | undefined>} The user record or undefined if not found.
	 */
	async findById(id: number): Promise<UserRecord | undefined> {
		return db("users").where("id", id).first();
	}

	/**
	 * @description Find a user by their hardware pairing code.
	 * @param {string} pairingCode - The user's current pairing code (2 letters + 6 digits).
	 * @returns {Promise<UserRecord | undefined>} The user record or undefined if not found.
	 */
	async findByPairingCode(pairingCode: string): Promise<UserRecord | undefined> {
		return db("users").where("pairing_code", pairingCode).first();
	}

	/**
	 * @description Update a user's profile fields. Only provided fields are updated.
	 * @param {number} userId - The user's database ID.
	 * @param {UpdateProfileDto} input - Object with optional name, profile_picture, push_token, notification_window_start, and notification_window_end.
	 * @returns {Promise<UserRecord>} The updated user record.
	 */
	async updateProfile(userId: number, input: UpdateProfileDto): Promise<UserRecord> {
		const [user] = await db("users")
			.where("id", userId)
			.update(input)
			.returning("*");

		return user;
	}

	/**
	 * @description Update a user's password hash.
	 * @param {number} userId - The user's database ID.
	 * @param {string} newPassword - The new password to store (plaintext, hashing pending).
	 * @returns {Promise<UserRecord>} The updated user record.
	 */
	async updatePassword(userId: number, newPassword: string): Promise<UserRecord> {
		const [user] = await db("users")
			.where("id", userId)
			.update({ password_hash: newPassword })
			.returning("*");

		return user;
	}

	/**
	 * @description Update a user's push notification token for mobile alerts.
	 * @param {number} userId - The user's database ID.
	 * @param {string} pushToken - The FCM/APNs device token.
	 * @returns {Promise<void>}
	 */
	async updatePushToken(userId: number, pushToken: string): Promise<void> {
		await db("users")
			.where("id", userId)
			.update({ push_token: pushToken });
	}

	/**
	 * @description Replace a user's pairing code with a new one (rotated after successful probe registration).
	 * @param {number} userId - The user's database ID.
	 * @param {string} pairingCode - The new pairing code to assign.
	 * @returns {Promise<UserRecord>} The updated user record.
	 */
	async updatePairingCode(userId: number, pairingCode: string): Promise<UserRecord> {
		const [user] = await db("users")
			.where("id", userId)
			.update({ pairing_code: pairingCode })
			.returning("*");

		return user;
	}
}
