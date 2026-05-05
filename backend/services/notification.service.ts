import { NotificationRepository } from "../repositories/notification.repository";
import { UserRepository } from "../repositories/user.repository";
import { ActiveIssueRecord, PendingNotificationRecord } from "../types/database";

export class NotificationService {
	private repository: NotificationRepository;
	private userRepository: UserRepository;

	constructor() {
		this.repository = new NotificationRepository();
		this.userRepository = new UserRepository();
	}

	async createOrUpdateIssue(input: { userPlantId: number; issueType: string }): Promise<ActiveIssueRecord | null> {
		const existingIssue = await this.repository.findActiveIssue(input.userPlantId, input.issueType);

		if (existingIssue) {
			return this.repository.incrementIssueOccurrence(existingIssue.id);
		}

		return this.repository.createIssue(input.userPlantId, input.issueType);
	}

	async createCoachNotification(input: {
		userId: number;
		userPlantId: number;
		issueId: number | null;
		title: string;
		message: string;
		notificationType: "sensor_alert" | "stage_validation" | "system_status";
	}): Promise<PendingNotificationRecord | null> {
		const user = await this.userRepository.findById(input.userId);

		if (!user) {
			return null;
		}

		const isInWindow = await this.isWithinNotificationWindow(input.userId);
		if (!isInWindow) {
			return null;
		}

		if (input.issueId) {
			const snoozedNotification = await this.repository.findSnoozedNotification(input.userId, input.issueId);

			if (snoozedNotification) {
				return null;
			}

			const sentNotification = await this.repository.findSentNotification(input.userId, input.issueId);

			if (sentNotification) {
				return null;
			}
		}

		return this.repository.createNotification(input);
	}

	async acknowledgeIssue(issueId: number): Promise<ActiveIssueRecord> {
		const issue = await this.repository.getActiveIssueById(issueId);

		if (!issue) {
			throw new Error("Issue not found");
		}

		return this.repository.acknowledgeIssue(issueId);
	}

	async resolveIssue(issueId: number): Promise<ActiveIssueRecord> {
		const issue = await this.repository.getActiveIssueById(issueId);

		if (!issue) {
			throw new Error("Issue not found");
		}

		return this.repository.resolveIssue(issueId);
	}

	async snoozeNotification(notificationId: number, minutes: number = 60): Promise<PendingNotificationRecord> {
		const notification = await this.repository.getNotificationById(notificationId);

		if (!notification) {
			throw new Error("Notification not found");
		}

		if (notification.notification_state === "acknowledged") {
			throw new Error("Cannot snooze an acknowledged notification");
		}

		const snoozedUntil = new Date();
		snoozedUntil.setMinutes(snoozedUntil.getMinutes() + minutes);

		return this.repository.snoozeNotification(notificationId, snoozedUntil);
	}

	async acknowledgeNotification(notificationId: number): Promise<PendingNotificationRecord> {
		const notification = await this.repository.getNotificationById(notificationId);

		if (!notification) {
			throw new Error("Notification not found");
		}

		return this.repository.acknowledgeNotification(notificationId);
	}

	async getUserNotifications(userId: number): Promise<PendingNotificationRecord[]> {
		return this.repository.getNotificationsByUser(userId);
	}

	async getUserActiveIssues(userId: number): Promise<ActiveIssueRecord[]> {
		return this.repository.getActiveIssuesByUser(userId);
	}

	async isWithinNotificationWindow(userId: number): Promise<boolean> {
		const user = await this.userRepository.findById(userId);

		if (!user) {
			return true;
		}

		const now = new Date();
		const currentTime = now.toTimeString().slice(0, 8);

		const windowStart = user.notification_window_start || "08:00:00";
		const windowEnd = user.notification_window_end || "22:00:00";

		return currentTime >= windowStart && currentTime <= windowEnd;
	}
}
