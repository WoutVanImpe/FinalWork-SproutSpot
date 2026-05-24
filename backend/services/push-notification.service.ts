import { Expo, ExpoPushMessage, ExpoPushTicket } from "expo-server-sdk";
import { UserRepository } from "../repositories/user.repository";

export class PushNotificationService {
	private expo: Expo;
	private userRepository: UserRepository;

	constructor(userRepository?: UserRepository) {
		this.expo = new Expo();
		this.userRepository = userRepository ?? new UserRepository();
	}

	async send(userId: number, title: string, body: string): Promise<void> {
		try {
			const user = await this.userRepository.findById(userId);

			if (!user?.push_token) {
				console.log(`[PUSH] No push_token for User ${userId} — skipping`);
				return;
			}

			if (!user.push_enabled) {
				console.log(`[PUSH] Push disabled for User ${userId} — skipping`);
				return;
			}

			const token = user.push_token;

			if (!Expo.isExpoPushToken(token)) {
				console.warn(`[PUSH] Invalid Expo push token for User ${userId}: "${token}" — clearing`);
				await this.userRepository.updatePushToken(userId, "");
				return;
			}

			const message: ExpoPushMessage = {
				to: token,
				sound: "default",
				title,
				body,
				data: { userId },
			};

			const tickets: ExpoPushTicket[] = await this.expo.sendPushNotificationsAsync([message]);

			for (const ticket of tickets) {
				if (ticket.status === "error") {
					console.error(`[PUSH] Ticket error for User ${userId}:`, ticket.message);

					if (ticket.details?.error === "DeviceNotRegistered") {
						console.warn(`[PUSH] Token expired for User ${userId} — clearing`);
						await this.userRepository.updatePushToken(userId, "");
					}
				} else {
					console.log(`[PUSH] Sent to User ${userId}: "${title}" (ticket: ${ticket.id})`);
				}
			}
		} catch (error) {
			const errMsg = (error as Error)?.message ?? "unknown error";
			console.error(`[PUSH] Failed for User ${userId}: ${errMsg}`);
		}
	}
}
