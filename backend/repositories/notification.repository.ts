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
	 * @description Set a notification's state to "snoozed" and snoozed_until to 12 hours from now.
	 * @param {number} notificationId - The notification's database ID.
	 * @returns {Promise<PendingNotificationRecord>} The updated notification record.
	 */
	async snoozeForHalfDay(notificationId: number): Promise<PendingNotificationRecord> {
		const [notification] = await db("pending_notifications")
			.where("id", notificationId)
			.update({
				notification_state: "snoozed",
				snoozed_until: db.raw("NOW() + INTERVAL '6 hours'"),
			})
			.returning("*");

		return notification;
	}

	/**
	 * @description Retrieve all snoozed notifications whose snoozed_until has passed, including user notification window info.
	 * @returns {Promise<any[]>} List of due snoozed notifications with user window data.
	 */
	async getDueSnoozedNotifications(): Promise<any[]> {
		return db("pending_notifications as pn")
			.join("users as u", "pn.user_id", "u.id")
			.where("pn.notification_state", "snoozed")
			.andWhere("pn.snoozed_until", "<=", db.fn.now())
			.select(
				"pn.id",
				"pn.user_id",
				"pn.user_plant_id",
				"pn.title",
				"pn.message",
				"pn.notification_type",
				"u.notification_window_start",
				"u.notification_window_end",
			);
	}

	/**
	 * @description Activate a snoozed notification by setting state to "sent" and clearing snoozed_until.
	 * @param {number} notificationId - The notification's database ID.
	 * @returns {Promise<void>}
	 */
	async activateSnoozedNotification(notificationId: number): Promise<void> {
		await db("pending_notifications")
			.where("id", notificationId)
			.update({ notification_state: "sent", snoozed_until: null });
	}

	/**
	 * @description Reschedule a snoozed notification to a new snoozed_until time.
	 * @param {number} notificationId - The notification's database ID.
	 * @param {Date} snoozedUntil - The new target time.
	 * @returns {Promise<void>}
	 */
	async rescheduleSnoozedNotification(notificationId: number, snoozedUntil: Date): Promise<void> {
		await db("pending_notifications")
			.where("id", notificationId)
			.update({ snoozed_until: snoozedUntil });
	}

	/**
	 * @description Get the count of unacknowledged notifications for a user.
	 * @param {number} userId - The user's database ID.
	 * @returns {Promise<number>} The count of unacknowledged notifications.
	 */
	async getUnacknowledgedCount(userId: number): Promise<number> {
		const [result] = await db("pending_notifications")
			.where("user_id", userId)
			.andWhere("notification_state", "sent")
			.count("* as count");

		return Number(result?.count ?? 0);
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
