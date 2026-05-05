import { db } from "../db/connection";
import { UserRecord } from "../types/database";
import { CreateUserDto, UpdateProfileDto } from "../types/dto";

export class UserRepository {
	async create(input: CreateUserDto): Promise<UserRecord> {
		const [user] = await db("users")
			.insert({
				name: input.name,
				email: input.email,
				password_hash: input.password,
			})
			.returning("*");

		return user;
	}

	async findByEmail(email: string): Promise<UserRecord | undefined> {
		const user = await db("users").where("email", email).first();
		return user;
	}

	async findById(id: number): Promise<UserRecord | undefined> {
		const user = await db("users").where("id", id).first();
		return user;
	}

	async updateProfile(userId: number, input: UpdateProfileDto): Promise<UserRecord> {
		const [user] = await db("users")
			.where("id", userId)
			.update(input)
			.returning("*");

		return user;
	}

	async updatePassword(userId: number, passwordHash: string): Promise<UserRecord> {
		const [user] = await db("users")
			.where("id", userId)
			.update({ password_hash: passwordHash })
			.returning("*");

		return user;
	}

	async updatePushToken(userId: number, pushToken: string): Promise<void> {
		await db("users")
			.where("id", userId)
			.update({ push_token: pushToken });
	}
}
