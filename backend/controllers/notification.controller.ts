import { Request, Response } from "express";
import { NotificationService } from "../services/notification.service";
import { PushNotificationService } from "../services/push-notification.service";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { buildImageUrl } from "../config";

const TYPE_MAP: Record<string, "problem" | "milestone"> = {
	sensor_alert: "problem",
	stage_validation: "milestone",
	system_status: "milestone",
};

function mapNotification(n: any) {
	const imageUri = buildImageUrl(n.plant_image ?? "");
	return {
		id: String(n.id),
		type: TYPE_MAP[n.notification_type] ?? "problem",
		title: n.title,
		description: n.message,
		image: imageUri ? { uri: imageUri } : null,
		snoozed: n.notification_state === "snoozed",
		created_at: n.created_at,
	};
}

export class NotificationController {
	private service: NotificationService;
	private pushService: PushNotificationService;

	constructor() {
		this.service = new NotificationService();
		this.pushService = new PushNotificationService();
	}

	/**
	 * @description Retrieve notifications for the authenticated user. Defaults to unacknowledged only unless `?all=true` is passed.
	 * @param {AuthenticatedRequest} req - Authenticated request with optional `all` query param.
	 * @param {Response} res - Express response with list of notifications.
	 * @returns {void}
	 */
	getUserNotifications = async (req: AuthenticatedRequest, res: Response) => {
		try {
			const userId = req.user?.id;

			if (!userId) {
				res.status(401).json({ error: "Unauthorized", message: "Authentication required" });
				return;
			}

			const onlyUnacknowledged = req.query.all !== "true";
			const notifications = await this.service.getUserNotifications(userId, onlyUnacknowledged);
			const mapped = notifications.map(mapNotification);

			res.status(200).json({ success: true, count: mapped.length, data: mapped });
		} catch (error) {
			console.error("[NotificationController] Error:", error);
			res.status(500).json({ error: "Internal Server Error", message: "Failed to retrieve notifications" });
		}
	};

	/**
	 * @description Acknowledge a notification and its linked active issue, marking both as seen by the user.
	 * @param {AuthenticatedRequest} req - Authenticated request with notificationId as URL parameter.
	 * @param {Response} res - Express response with acknowledged notification and issue data.
	 * @returns {void}
	 */
	acknowledgeNotification = async (req: AuthenticatedRequest, res: Response) => {
		try {
			const id = Number.parseInt(req.params.notificationId as string);

			if (Number.isNaN(id)) {
				res.status(400).json({ error: "Validation Error", message: "Invalid notification ID" });
				return;
			}

			const result = await this.service.acknowledgeNotification(id);

			res.status(200).json({ success: true, message: "Notification acknowledged", data: result });
		} catch (error) {
			if ((error as Error).message === "Notification not found") {
				res.status(404).json({ error: "Not Found", message: (error as Error).message });
				return;
			}

			console.error("[NotificationController] Error:", error);
			res.status(500).json({ error: "Internal Server Error", message: "Failed to acknowledge notification" });
		}
	};

	/**
	 * @description Resolve an active issue by setting its resolved_at timestamp.
	 * @param {AuthenticatedRequest} req - Authenticated request with issueId as URL parameter.
	 * @param {Response} res - Express response with resolved issue data.
	 * @returns {void}
	 */
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

	/**
	 * @description Reset a notification's state — now snoozes for 12 hours instead of immediately re-sending.
	 * @param {AuthenticatedRequest} req - Authenticated request with notificationId as URL parameter.
	 * @param {Response} res - Express response with updated notification data.
	 * @returns {void}
	 */
	resetNotificationState = async (req: AuthenticatedRequest, res: Response) => {
		try {
			const id = Number.parseInt(req.params.notificationId as string);

			if (Number.isNaN(id)) {
				res.status(400).json({ error: "Validation Error", message: "Invalid notification ID" });
				return;
			}

			const notification = await this.service.resetNotificationState(id);

			res.status(200).json({ success: true, message: "Notification snoozed for 12 hours", data: notification });
		} catch (error) {
			if ((error as Error).message === "Notification not found") {
				res.status(404).json({ error: "Not Found", message: (error as Error).message });
				return;
			}

			console.error("[NotificationController] Error:", error);
			res.status(500).json({ error: "Internal Server Error", message: "Failed to reset notification" });
		}
	};

	/**
	 * @description Get the count of unacknowledged notifications for the authenticated user.
	 * @param {AuthenticatedRequest} req - Authenticated request.
	 * @param {Response} res - Express response with count.
	 * @returns {void}
	 */
	getNotificationCount = async (req: AuthenticatedRequest, res: Response) => {
		try {
			const userId = req.user?.id;

			if (!userId) {
				res.status(401).json({ error: "Unauthorized", message: "Authentication required" });
				return;
			}

			const count = await this.service.getUnacknowledgedCount(userId);

			res.status(200).json({ success: true, count });
		} catch (error) {
			console.error("[NotificationController] Error:", error);
			res.status(500).json({ error: "Internal Server Error", message: "Failed to get notification count" });
		}
	};
}
