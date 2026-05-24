import { db } from "../db/connection";
import { ActiveIssueRecord, PendingNotificationRecord } from "../types/database";

export class NotificationRepository {
	/**
	 * @description Retrieve notifications for a user, optionally filtering out acknowledged ones. Limited to 50 results ordered newest first.
	 * @param {number} userId - The user's database ID.
	 * @param {boolean} onlyUnacknowledged - When true, excludes notifications with state "acknowledged".
	 * @returns {Promise<PendingNotificationRecord[]>} List of notification records.
	 */
	async getNotificationsByUser(userId: number, onlyUnacknowledged: boolean) {
		let query = db("pending_notifications as pn")
			.leftJoin("user_plants as up", "pn.user_plant_id", "up.id")
			.leftJoin("plants as pl", "up.plant_id", "pl.id")
			.where("pn.user_id", userId)
			.orderBy("pn.created_at", "desc")
			.limit(50);

		if (onlyUnacknowledged) {
			query = query.andWhereNot("pn.notification_state", "acknowledged");
		}

		return query.select(
			"pn.*",
			"pl.image as plant_image",
			"pl.name as plant_name"
		);
	}

	/**
	 * @description Set a notification's state to "acknowledged".
	 * @param {number} notificationId - The notification's database ID.
	 * @returns {Promise<PendingNotificationRecord>} The updated notification record.
	 */
	async acknowledgeNotification(notificationId: number): Promise<PendingNotificationRecord> {
		const [notification] = await db("pending_notifications")
			.where("id", notificationId)
			.update({ notification_state: "acknowledged" })
			.returning("*");

		return notification;
	}

	/**
	 * @description Mark an active issue as user-acknowledged, but only if it has not been resolved yet.
	 * @param {number} issueId - The active issue's database ID.
	 * @returns {Promise<ActiveIssueRecord | undefined>} The updated issue record or undefined if already resolved.
	 */
	async acknowledgeIssue(issueId: number): Promise<ActiveIssueRecord | undefined> {
		const [issue] = await db("active_issues")
			.where("id", issueId)
			.whereNull("resolved_at")
			.update({ user_acknowledged: true })
			.returning("*");

		return issue;
	}

	/**
	 * @description Resolve an active issue by setting its resolved_at timestamp to the current time.
	 * @param {number} issueId - The active issue's database ID.
	 * @returns {Promise<ActiveIssueRecord | undefined>} The resolved issue record.
	 */
	async resolveIssue(issueId: number): Promise<ActiveIssueRecord | undefined> {
		const [issue] = await db("active_issues")
			.where("id", issueId)
			.update({ resolved_at: db.fn.now() })
			.returning("*");

		return issue;
	}

	/**
	 * @description Reset a notification's state back to "sent" and clear any snooze timer.
	 * @param {number} notificationId - The notification's database ID.
	 * @returns {Promise<PendingNotificationRecord>} The reset notification record.
	 */
	async resetNotificationState(notificationId: number): Promise<PendingNotificationRecord> {
		const [notification] = await db("pending_notifications")
			.where("id", notificationId)
			.update({ notification_state: "sent", snoozed_until: null })
			.returning("*");

		return notification;
	}

	/**
	 * @description Find a single notification by its database ID.
	 * @param {number} notificationId - The notification's database ID.
	 * @returns {Promise<PendingNotificationRecord | undefined>} The notification record or undefined if not found.
	 */
	async getNotificationById(notificationId: number): Promise<PendingNotificationRecord | undefined> {
		return db("pending_notifications").where("id", notificationId).first();
	}

	/**
	 * @description Retrieve the issue_id associated with a specific notification.
	 * @param {number} notificationId - The notification's database ID.
	 * @returns {Promise<number | null>} The linked issue ID or null if none.
	 */
	async getIssueByNotification(notificationId: number): Promise<number | null> {
		const result = await db("pending_notifications")
			.where("id", notificationId)
			.select("issue_id")
			.first();

		return result?.issue_id ?? null;
	}
}
