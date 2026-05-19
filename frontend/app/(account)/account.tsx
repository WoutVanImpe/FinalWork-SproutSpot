import React, { useState, useCallback, useEffect } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../../context/AuthContext";
import { getProfile, updateProfile, changePassword as changePasswordApi } from "../../services/auth";
import { getNotifications, acknowledgeNotification, resetNotification } from "../../services/notifications";
import type { NotificationItem as ApiNotification } from "../../services/notifications";

import AccountMain from "../../components/pages/account/main/AccountMain";
import NotificationsView from "../../components/pages/account/notifications/NotificationsView";
import type { NotificationItem } from "../../components/pages/account/notifications/NotificationsView";
import ValidateStep1 from "../../components/pages/account/validate/ValidateStep1";
import ValidateStep2 from "../../components/pages/account/validate/ValidateStep2";
import HistoryView from "../../components/pages/account/history/HistoryView";
import type { HistoryEntry } from "../../components/pages/account/history/HistoryView";
import SettingsView from "../../components/pages/account/settings/SettingsView";

function apiNotifToView(n: ApiNotification): NotificationItem {
	return {
		id: n.id,
		type: n.type,
		title: n.title,
		description: n.description,
		image: n.image ?? (0 as unknown as number),
		snoozed: n.snoozed,
	};
}

const Account = () => {
	const { logout: authLogout } = useAuth();
	const [currentView, setCurrentView] = useState<string>("main");

	useFocusEffect(
		useCallback(() => {
			setCurrentView("main");
		}, []),
	);

	const [notifications, setNotifications] = useState<NotificationItem[]>([]);
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [pairingCode, setPairingCode] = useState("");
	const [pushEnabled, setPushEnabled] = useState(true);
	const [activeHours, setActiveHours] = useState<number[]>([8, 9, 10]);
	const [historyEntries] = useState<HistoryEntry[]>([]);

	useEffect(() => {
		getNotifications(true)
			.then((res) => { if (res.data) setNotifications(res.data.map(apiNotifToView)); })
			.catch(console.error);
		getProfile()
			.then((res) => {
				if (res.data) {
					setName(res.data.name);
					setEmail(res.data.email);
					setPairingCode(res.data.pairing_code);
				}
			})
			.catch(console.error);
	}, []);

	const handleLogout = () => {
		authLogout();
	};

	const handleDismiss = async (id: string) => {
		try {
			await acknowledgeNotification(id);
			setNotifications((prev) => prev.filter((n) => n.id !== id));
		} catch (err) {
			console.error(err);
		}
	};

	const handleSnooze = async (id: string) => {
		try {
			await resetNotification(id);
			setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, snoozed: true } : n)));
		} catch (err) {
			console.error(err);
		}
	};

	const handleConfirmPhaseUpdate = () => {
		setCurrentView("main");
	};

	const handlePasswordChange = async (currentPassword: string, newPassword: string) => {
		await changePasswordApi(currentPassword, newPassword);
	};

	const handleNameChange = async (newName: string) => {
		await updateProfile({ name: newName });
		setName(newName);
	};

	const handlePushChange = (val: boolean) => setPushEnabled(val);
	const handleActiveHoursChange = (hours: number[]) => setActiveHours(hours);

	switch (currentView) {
		case "main":
			return <AccountMain onNavigate={setCurrentView} onLogout={handleLogout} />;
		case "notifications":
			return <NotificationsView notifications={notifications} onBack={() => setCurrentView("main")} onDismiss={handleDismiss} onSnooze={handleSnooze} onValidate={() => setCurrentView("validate_step1")} />;
		case "validate_step1":
			return <ValidateStep1 onBack={() => setCurrentView("notifications")} onNext={() => setCurrentView("validate_step2")} />;
		case "validate_step2":
			return <ValidateStep2 onBack={() => setCurrentView("validate_step1")} onConfirm={handleConfirmPhaseUpdate} />;
		case "history":
			return <HistoryView entries={historyEntries} onBack={() => setCurrentView("main")} />;
		case "settings":
			return (
				<SettingsView
					onBack={() => setCurrentView("main")}
					name={name}
					email={email}
					pairingCode={pairingCode}
					pushEnabled={pushEnabled}
					activeHours={activeHours}
					onNameChange={handleNameChange}
					onPasswordChange={handlePasswordChange}
					onPushChange={handlePushChange}
					onActiveHoursChange={handleActiveHoursChange}
				/>
			);
		default:
			return <AccountMain onNavigate={setCurrentView} onLogout={handleLogout} />;
	}
};

export default Account;
