import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { UserService } from "../services/user.service";
import { CreateUserDto, UpdateProfileDto } from "../types/dto";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { JWT_SECRET } from "../config";

export class UserController {
	private readonly service: UserService;

	constructor() {
		this.service = new UserService();
	}

	private generateToken(user: { id: number; email: string }): string {
		return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "30d" });
	}

	/**
	 * @description Create a new user account with name, email, and password. Returns an auto-generated pairing_code and JWT token.
	 * @param {Request} req - Express request with { name, email, password } in body.
	 * @param {Response} res - Express response with created user data (including token and pairing_code) or error.
	 * @returns {void}
	 */
	signup = async (req: Request, res: Response) => {
		try {
			const { name, email, password } = req.body;

			if (!name || !email || !password) {
				res.status(400).json({ error: "Validation Error", message: "name, email, and password are required" });
				return;
			}

			const input: CreateUserDto = { name, email, password };
			const user = await this.service.signup(input);
			const token = this.generateToken(user);

			res.status(201).json({
				success: true,
				message: "Account created successfully",
				data: { id: user.id, name: user.name, email: user.email, pairing_code: user.pairing_code, token, created_at: user.created_at },
			});
		} catch (error) {
			if ((error as Error).message === "Email already registered") {
				res.status(409).json({ error: "Conflict", message: (error as Error).message });
				return;
			}

			console.error("[UserController] Error:", error);
			res.status(500).json({ error: "Internal Server Error", message: "Failed to create account" });
		}
	};

	/**
	 * @description Authenticate a user with email and password. Returns a JWT token.
	 * @param {Request} req - Express request with { email, password } in body.
	 * @param {Response} res - Express response with authenticated user data and token or error.
	 * @returns {void}
	 */
	login = async (req: Request, res: Response) => {
		try {
			const { email, password } = req.body;

			if (!email || !password) {
				res.status(400).json({ error: "Validation Error", message: "email and password are required" });
				return;
			}

			const user = await this.service.login(email, password);
			const token = this.generateToken(user);

			res.status(200).json({
				success: true,
				message: "Login successful",
				data: { id: user.id, name: user.name, email: user.email, token },
			});
		} catch (error) {
			if ((error as Error).message === "Invalid email or password") {
				res.status(401).json({ error: "Unauthorized", message: (error as Error).message });
				return;
			}

			console.error("[UserController] Error:", error);
			res.status(500).json({ error: "Internal Server Error", message: "Failed to login" });
		}
	};

	/**
	 * @description Retrieve the authenticated user's full profile.
	 * @param {AuthenticatedRequest} req - Authenticated request containing user ID.
	 * @param {Response} res - Express response with user profile data.
	 * @returns {void}
	 */
	getProfile = async (req: AuthenticatedRequest, res: Response) => {
		try {
			const userId = req.user?.id;

			if (!userId) {
				res.status(401).json({ error: "Unauthorized", message: "User authentication required" });
				return;
			}

			const user = await this.service.getProfile(userId);

			res.status(200).json({
				success: true,
				data: {
					id: user.id,
					name: user.name,
					email: user.email,
					profile_picture: user.profile_picture,
					push_token: user.push_token,
					push_enabled: user.push_enabled,
					pairing_code: user.pairing_code,
					notification_window_start: user.notification_window_start,
					notification_window_end: user.notification_window_end,
					created_at: user.created_at,
				},
			});
		} catch (error) {
			if ((error as Error).message === "User not found") {
				res.status(404).json({ error: "Not Found", message: (error as Error).message });
				return;
			}

			console.error("[UserController] Error:", error);
			res.status(500).json({ error: "Internal Server Error", message: "Failed to retrieve profile" });
		}
	};

	/**
	 * @description Update the authenticated user's profile fields (name, profile picture, push token, notification window).
	 * @param {AuthenticatedRequest} req - Authenticated request with profile fields in body.
	 * @param {Response} res - Express response with updated user data.
	 * @returns {void}
	 */
	updateProfile = async (req: AuthenticatedRequest, res: Response) => {
		try {
			const userId = req.user?.id;

			if (!userId) {
				res.status(401).json({ error: "Unauthorized", message: "User authentication required" });
				return;
			}

			const { name, profile_picture, push_token, push_enabled, notification_window_start, notification_window_end } = req.body;

			const input: UpdateProfileDto = {
				name,
				profile_picture,
				push_token,
				push_enabled,
				notification_window_start,
				notification_window_end,
			};

			const user = await this.service.updateProfile(userId, input);

			res.status(200).json({
				success: true,
				message: "Profile updated successfully",
				data: {
					id: user.id,
					name: user.name,
					email: user.email,
					profile_picture: user.profile_picture,
					push_enabled: user.push_enabled,
					notification_window_start: user.notification_window_start,
					notification_window_end: user.notification_window_end,
				},
			});
		} catch (error) {
			console.error("[UserController] Error:", error);
			res.status(500).json({ error: "Internal Server Error", message: "Failed to update profile" });
		}
	};

	/**
	 * @description Update the user's push notification token for mobile alerts.
	 * @param {AuthenticatedRequest} req - Authenticated request with { push_token } in body.
	 * @param {Response} res - Express response with success confirmation.
	 * @returns {void}
	 */
	updatePushToken = async (req: AuthenticatedRequest, res: Response) => {
		try {
			const userId = req.user?.id;

			if (!userId) {
				res.status(401).json({ error: "Unauthorized", message: "User authentication required" });
				return;
			}

			const { push_token } = req.body;

			if (!push_token) {
				res.status(400).json({ error: "Validation Error", message: "push_token is required" });
				return;
			}

			await this.service.updatePushToken(userId, push_token);

			res.status(200).json({ success: true, message: "Push token updated" });
		} catch (error) {
			console.error("[UserController] Error:", error);
			res.status(500).json({ error: "Internal Server Error", message: "Failed to update push token" });
		}
	};

	/**
	 * @description Change the authenticated user's password. Requires current password for verification.
	 * @param {AuthenticatedRequest} req - Authenticated request with { current_password, new_password } in body.
	 * @param {Response} res - Express response with success confirmation.
	 * @returns {void}
	 */
	changePassword = async (req: AuthenticatedRequest, res: Response) => {
		try {
			const userId = req.user?.id;

			if (!userId) {
				res.status(401).json({ error: "Unauthorized", message: "User authentication required" });
				return;
			}

			const { current_password, new_password } = req.body;

			if (!current_password || !new_password) {
				res.status(400).json({ error: "Validation Error", message: "current_password and new_password are required" });
				return;
			}

			await this.service.updatePassword(userId, current_password, new_password);

			res.status(200).json({ success: true, message: "Password updated successfully" });
		} catch (error) {
			if ((error as Error).message === "Current password is incorrect") {
				res.status(400).json({ error: "Bad Request", message: (error as Error).message });
				return;
			}

			console.error("[UserController] Error:", error);
			res.status(500).json({ error: "Internal Server Error", message: "Failed to update password" });
		}
	};
}
