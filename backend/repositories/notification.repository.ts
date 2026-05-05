import { db } from "../db/connection";
import { ActiveIssueRecord, PendingNotificationRecord } from "../types/database";

export class NotificationRepository {
	async createIssue(userPlantId: number, issueType: string): Promise<ActiveIssueRecord> {
		const [issue] = await db("active_issues")
			.insert({
				user_plant_id: userPlantId,
				issue_type: issueType,
			})
			.returning("*");

		return issue;
	}

	async findActiveIssue(userPlantId: number, issueType: string): Promise<ActiveIssueRecord | undefined> {
		const issue = await db("active_issues")
			.where("user_plant_id", userPlantId)
			.andWhere("issue_type", issueType)
			.whereNull("resolved_at")
			.first();

		return issue;
	}

	async incrementIssueOccurrence(issueId: number): Promise<ActiveIssueRecord> {
		const [issue] = await db("active_issues")
			.where("id", issueId)
			.increment("occurrence_count", 1)
			.update({ last_seen: db.fn.now() })
			.returning("*");

		return issue;
	}

	async resolveIssue(issueId: number): Promise<ActiveIssueRecord> {
		const [issue] = await db("active_issues")
			.where("id", issueId)
			.update({
				resolved_at: db.fn.now(),
				user_acknowledged: true,
			})
			.returning("*");

		return issue;
	}

	async acknowledgeIssue(issueId: number): Promise<ActiveIssueRecord> {
		const [issue] = await db("active_issues")
			.where("id", issueId)
			.update({ user_acknowledged: true })
			.returning("*");

		return issue;
	}

	async getActiveIssuesByUserPlant(userPlantId: number): Promise<ActiveIssueRecord[]> {
		const issues = await db("active_issues")
			.where("user_plant_id", userPlantId)
			.whereNull("resolved_at")
			.orderBy("last_seen", "desc");

		return issues;
	}

	async getActiveIssuesByUser(userId: number): Promise<ActiveIssueRecord[]> {
		const issues = await db("active_issues as ai")
			.join("user_plants as up", "ai.user_plant_id", "up.id")
			.where("up.user_id", userId)
			.whereNull("ai.resolved_at")
			.select("ai.*")
			.orderBy("ai.last_seen", "desc");

		return issues;
	}

	async createNotification(input: {
		userId: number;
		userPlantId: number;
		issueId: number | null;
		title: string;
		message: string;
		notificationType: "sensor_alert" | "stage_validation" | "system_status";
	}): Promise<PendingNotificationRecord> {
		const [notification] = await db("pending_notifications")
			.insert({
				user_id: input.userId,
				user_plant_id: input.userPlantId,
				issue_id: input.issueId,
				title: input.title,
				message: input.message,
				notification_type: input.notificationType,
				notification_state: "pending",
			})
			.returning("*");

		return notification;
	}

	async findPendingNotification(userId: number, issueId: number): Promise<PendingNotificationRecord | undefined> {
		const notification = await db("pending_notifications")
			.where("user_id", userId)
			.andWhere("issue_id", issueId)
			.andWhere("notification_state", "pending")
			.orderBy("created_at", "desc")
			.first();

		return notification;
	}

	async findSnoozedNotification(userId: number, issueId: number): Promise<PendingNotificationRecord | undefined> {
		const notification = await db("pending_notifications")
			.where("user_id", userId)
			.andWhere("issue_id", issueId)
			.andWhere("notification_state", "snoozed")
			.andWhere("snoozed_until", ">", db.fn.now())
			.first();

		return notification;
	}

	async snoozeNotification(notificationId: number, snoozedUntil: Date): Promise<PendingNotificationRecord> {
		const [notification] = await db("pending_notifications")
			.where("id", notificationId)
			.update({
				notification_state: "snoozed",
				snoozed_until: snoozedUntil,
			})
			.returning("*");

		return notification;
	}

	async dismissNotification(notificationId: number): Promise<PendingNotificationRecord> {
		const [notification] = await db("pending_notifications")
			.where("id", notificationId)
			.update({ notification_state: "dismissed" })
			.returning("*");

		return notification;
	}

	async getNotificationsByUser(userId: number): Promise<PendingNotificationRecord[]> {
		const notifications = await db("pending_notifications")
			.where("user_id", userId)
			.orderBy("created_at", "desc")
			.limit(50);

		return notifications;
	}

	async markNotificationSent(notificationId: number): Promise<PendingNotificationRecord> {
		const [notification] = await db("pending_notifications")
			.where("id", notificationId)
			.update({ notification_state: "sent" })
			.returning("*");

		return notification;
	}

	async getActiveIssueById(issueId: number): Promise<ActiveIssueRecord | undefined> {
		const issue = await db("active_issues").where("id", issueId).first();
		return issue;
	}

	async getNotificationById(notificationId: number): Promise<PendingNotificationRecord | undefined> {
		const notification = await db("pending_notifications").where("id", notificationId).first();
		return notification;
	}
}
