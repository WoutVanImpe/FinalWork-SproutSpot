import { api } from "./api";

export interface NotificationItem {
	id: string;
	type: "problem" | "milestone";
	title: string;
	description: string;
	image: { uri: string } | null;
	snoozed: boolean;
	created_at: string;
	userPlantId: number | null;
	nextStageOrder: number | null;
}

export function getNotifications(all = false) {
	return api.get<NotificationItem[]>(`/api/notifications${all ? "?all=true" : ""}`);
}

export function acknowledgeNotification(notificationId: string) {
	return api.post<void>(`/api/notifications/${notificationId}/acknowledge`);
}

export function resolveIssue(issueId: string) {
	return api.post<void>(`/api/notifications/issues/${issueId}/resolve`);
}

export function resetNotification(notificationId: string, hours?: number) {
	return api.post<void>(`/api/notifications/${notificationId}/reset`, hours ? { hours } : undefined);
}

export function getNotificationCount() {
	return api.get<{ count: number }>("/api/notifications/count");
}
