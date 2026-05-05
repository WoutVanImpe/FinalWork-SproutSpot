import { Response } from "express";
import { NotificationService } from "../services/notification.service";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export class NotificationController {
	private readonly service: NotificationService;

	constructor() {
		this.service = new NotificationService();
	}

	getUserNotifications = async (req: AuthenticatedRequest, res: Response) => {
		try {
			const userId = req.user?.id;

			if (!userId) {
				res.status(401).json({ error: "Unauthorized", message: "User authentication required" });
				return;
			}

			const notifications = await this.service.getUserNotifications(userId);

			res.status(200).json({ success: true, count: notifications.length, data: notifications });
		} catch (error) {
			console.error("[NotificationController] Error:", error);
			res.status(500).json({ error: "Internal Server Error", message: "Failed to retrieve notifications" });
		}
	};

	getUserActiveIssues = async (req: AuthenticatedRequest, res: Response) => {
		try {
			const userId = req.user?.id;

			if (!userId) {
				res.status(401).json({ error: "Unauthorized", message: "User authentication required" });
				return;
			}

			const issues = await this.service.getUserActiveIssues(userId);

			res.status(200).json({ success: true, count: issues.length, data: issues });
		} catch (error) {
			console.error("[NotificationController] Error:", error);
			res.status(500).json({ error: "Internal Server Error", message: "Failed to retrieve active issues" });
		}
	};

	acknowledgeIssue = async (req: AuthenticatedRequest, res: Response) => {
		try {
			const id = Number.parseInt(req.params.issueId as string);

			if (Number.isNaN(id)) {
				res.status(400).json({ error: "Validation Error", message: "Invalid issue ID" });
				return;
			}

			const issue = await this.service.acknowledgeIssue(id);

			res.status(200).json({ success: true, message: "Issue acknowledged", data: issue });
		} catch (error) {
			if ((error as Error).message === "Issue not found") {
				res.status(404).json({ error: "Not Found", message: (error as Error).message });
				return;
			}

			console.error("[NotificationController] Error:", error);
			res.status(500).json({ error: "Internal Server Error", message: "Failed to acknowledge issue" });
		}
	};

	resolveIssue = async (req: AuthenticatedRequest, res: Response) => {
		try {
			const id = Number.parseInt(req.params.issueId as string);

			if (Number.isNaN(id)) {
				res.status(400).json({ error: "Validation Error", message: "Invalid issue ID" });
				return;
			}

			const issue = await this.service.resolveIssue(id);

			res.status(200).json({ success: true, message: "Issue resolved", data: issue });
		} catch (error) {
			if ((error as Error).message === "Issue not found") {
				res.status(404).json({ error: "Not Found", message: (error as Error).message });
				return;
			}

			console.error("[NotificationController] Error:", error);
			res.status(500).json({ error: "Internal Server Error", message: "Failed to resolve issue" });
		}
	};

	snoozeNotification = async (req: AuthenticatedRequest, res: Response) => {
		try {
			const id = Number.parseInt(req.params.notificationId as string);

			if (Number.isNaN(id)) {
				res.status(400).json({ error: "Validation Error", message: "Invalid notification ID" });
				return;
			}

			const { minutes } = req.body;
			const snoozeMinutes = minutes || 60;

			const notification = await this.service.snoozeNotification(id, snoozeMinutes);

			res.status(200).json({ success: true, message: `Notification snoozed for ${snoozeMinutes} minutes`, data: notification });
		} catch (error) {
			const msg = (error as Error).message;
			if (msg.includes("not found") || msg.includes("acknowledged")) {
				res.status(400).json({ error: "Bad Request", message: msg });
				return;
			}

			console.error("[NotificationController] Error:", error);
			res.status(500).json({ error: "Internal Server Error", message: "Failed to snooze notification" });
		}
	};

	acknowledgeNotification = async (req: AuthenticatedRequest, res: Response) => {
		try {
			const id = Number.parseInt(req.params.notificationId as string);

			if (Number.isNaN(id)) {
				res.status(400).json({ error: "Validation Error", message: "Invalid notification ID" });
				return;
			}

			const notification = await this.service.acknowledgeNotification(id);

			res.status(200).json({ success: true, message: "Notification acknowledged", data: notification });
		} catch (error) {
			if ((error as Error).message === "Notification not found") {
				res.status(404).json({ error: "Not Found", message: (error as Error).message });
				return;
			}

			console.error("[NotificationController] Error:", error);
			res.status(500).json({ error: "Internal Server Error", message: "Failed to acknowledge notification" });
		}
	};
}
