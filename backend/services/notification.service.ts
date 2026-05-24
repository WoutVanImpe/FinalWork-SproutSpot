import { NotificationRepository } from "../repositories/notification.repository";
import { ActiveIssueRecord, PendingNotificationRecord } from "../types/database";

export class NotificationService {
	private repository: NotificationRepository;

	constructor() {
		this.repository = new NotificationRepository();
	}

	/**
	 * @description Retrieve notifications for a user. Can filter to only unacknowledged notifications.
	 * @param {number} userId - The user's database ID.
	 * @param {boolean} onlyUnacknowledged - When true, excludes acknowledged notifications (default).
	 * @returns {Promise<PendingNotificationRecord[]>} List of notification records ordered newest first.
	 */
	async getUserNotifications(userId: number, onlyUnacknowledged: boolean = true): Promise<PendingNotificationRecord[]> {
		return this.repository.getNotificationsByUser(userId, onlyUnacknowledged);
	}

	/**
	 * @description Acknowledge a notification and its linked active issue, marking both as seen by the user.
	 * @param {number} notificationId - The notification's database ID.
	 * @returns {Promise<{ notification: PendingNotificationRecord; issue: ActiveIssueRecord | null }>} Updated notification and optionally the acknowledged issue.
	 */
	async acknowledgeNotification(notificationId: number): Promise<{ notification: PendingNotificationRecord; issue?: ActiveIssueRecord | null }> {
		const notification = await this.repository.getNotificationById(notificationId);

		if (!notification) {
			throw new Error("Notification not found");
		}

		const updatedNotification = await this.repository.acknowledgeNotification(notificationId);

		let issue: ActiveIssueRecord | null = null;
		if (notification.issue_id) {
			issue = await this.repository.acknowledgeIssue(notification.issue_id) ?? null;
		}

		return { notification: updatedNotification, issue };
	}

	/**
	 * @description Resolve an active issue by setting its resolved_at timestamp.
	 * @param {number} issueId - The active issue's database ID.
	 * @returns {Promise<ActiveIssueRecord>} The resolved issue record.
	 */
	async resolveIssue(issueId: number): Promise<ActiveIssueRecord> {
		const issue = await this.repository.resolveIssue(issueId);

		if (!issue) {
			throw new Error("Issue not found");
		}

		return issue;
	}

	/**
	 * @description Reset a notification's state back to "sent" and clear any snooze timer, effectively re-triggering it.
	 * @param {number} notificationId - The notification's database ID.
	 * @returns {Promise<PendingNotificationRecord>} The reset notification record.
	 */
	async resetNotificationState(notificationId: number): Promise<PendingNotificationRecord> {
		const notification = await this.repository.getNotificationById(notificationId);

		if (!notification) {
			throw new Error("Notification not found");
		}

		return this.repository.resetNotificationState(notificationId);
	}
}
