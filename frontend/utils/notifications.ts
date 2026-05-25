import * as Device from "expo-device";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";

export async function registerForPushNotificationsAsync(): Promise<string | null> {
	if (!Device.isDevice) {
		console.warn("[PushNotifications] Must use a physical device for push notifications");
		return null;
	}

	const { status: existingStatus } = await Notifications.getPermissionsAsync();
	console.log("[PushNotifications] Existing permission status:", existingStatus);
	let finalStatus = existingStatus;

	if (existingStatus !== "granted") {
		const { status } = await Notifications.requestPermissionsAsync();
		finalStatus = status;
		console.log("[PushNotifications] Requested permission, status:", finalStatus);
	}

	if (finalStatus !== "granted") {
		console.warn("[PushNotifications] Permission not granted");
		return null;
	}

	const projectId = Constants.expoConfig?.extra?.eas?.projectId;
	console.log("[PushNotifications] projectId:", projectId);
	console.log("[PushNotifications] expoConfig keys:", Object.keys(Constants.expoConfig ?? {}));
	const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
	const token = tokenData.data;
	console.log("[PushNotifications] token:", token);

	if (Platform.OS === "android") {
		await Notifications.setNotificationChannelAsync("default", {
			name: "default",
			importance: Notifications.AndroidImportance.MAX,
			vibrationPattern: [0, 250, 250, 250],
			lightColor: "#00CA68",
		});
	}

	return token;
}
