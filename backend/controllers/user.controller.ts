import { Request, Response } from "express";
import { UserService } from "../services/user.service";
import { CreateUserDto, UpdateProfileDto } from "../types/dto";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export class UserController {
	private readonly service: UserService;

	constructor() {
		this.service = new UserService();
	}

	signup = async (req: Request, res: Response) => {
		try {
			const { name, email, password } = req.body;

			if (!name || !email || !password) {
				res.status(400).json({ error: "Validation Error", message: "name, email, and password are required" });
				return;
			}

			const input: CreateUserDto = { name, email, password };
			const user = await this.service.signup(input);

			res.status(201).json({
				success: true,
				message: "Account created successfully",
				data: { id: user.id, name: user.name, email: user.email, created_at: user.created_at },
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

	login = async (req: Request, res: Response) => {
		try {
			const { email, password } = req.body;

			if (!email || !password) {
				res.status(400).json({ error: "Validation Error", message: "email and password are required" });
				return;
			}

			const user = await this.service.login(email, password);

			res.status(200).json({
				success: true,
				message: "Login successful",
				data: { id: user.id, name: user.name, email: user.email },
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

	updateProfile = async (req: AuthenticatedRequest, res: Response) => {
		try {
			const userId = req.user?.id;

			if (!userId) {
				res.status(401).json({ error: "Unauthorized", message: "User authentication required" });
				return;
			}

			const { name, profile_picture, push_token, notification_window_start, notification_window_end } = req.body;

			const input: UpdateProfileDto = {
				name,
				profile_picture,
				push_token,
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
					notification_window_start: user.notification_window_start,
					notification_window_end: user.notification_window_end,
				},
			});
		} catch (error) {
			console.error("[UserController] Error:", error);
			res.status(500).json({ error: "Internal Server Error", message: "Failed to update profile" });
		}
	};

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
}
