export class PushNotificationService {
	async send(userId: number, title: string, body: string): Promise<void> {
		console.log(`[PUSH DISPATCH] Sending to User ${userId}: ${title} - ${body}`);
	}
}
