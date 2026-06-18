import React, { useState, useCallback, useEffect, useRef } from "react";
import { Alert } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../../context/AuthContext";
import { getProfile, updateProfile, changePassword as changePasswordApi } from "../../services/auth";
import { getNotifications, acknowledgeNotification, resetNotification } from "../../services/notifications";
import type { NotificationItem as ApiNotification } from "../../services/notifications";
import { advanceStage } from "../../services/garden";

import AccountMain from "../../components/pages/account/main/AccountMain";
import NotificationsView from "../../components/pages/account/notifications/NotificationsView";
import type { NotificationViewItem } from "../../components/pages/account/notifications/NotificationsView";
import ValidateStep1 from "../../components/pages/account/validate/ValidateStep1";
import ValidateStep2 from "../../components/pages/account/validate/ValidateStep2";
import HistoryView from "../../components/pages/account/history/HistoryView";
import type { HistoryEntry } from "../../components/pages/account/history/HistoryView";
import ProbesView from "../../components/pages/account/probes/ProbesView";
import SettingsView from "../../components/pages/account/settings/SettingsView";

function apiNotifToView(n: ApiNotification): NotificationViewItem {
	return {
		id: n.id,
		type: n.type,
		title: n.title,
		description: n.description,
		image: n.image ?? null,
		snoozed: n.snoozed,
		userPlantId: n.userPlantId ?? undefined,
		nextStageOrder: n.nextStageOrder ?? undefined,
		plantName: n.plantName ?? undefined,
		validationDescription: n.validationDescription ?? undefined,
	};
}

function parseTimeRangeToHours(start: string, end: string): number[] {
	const startHour = parseInt(start.split(":")[0], 10);
	const endHour = parseInt(end.split(":")[0], 10);
	const hours: number[] = [];
	for (let h = startHour; h <= endHour; h++) {
		hours.push(h);
	}
	return hours;
}

function hoursToTimeRange(hours: number[]): { start: string; end: string } {
	const sorted = [...hours].sort((a, b) => a - b);
	let s = sorted[0];
	let e = sorted[0];
	for (let i = 1; i < sorted.length; i++) {
		if (sorted[i] === e + 1) {
			e = sorted[i];
		} else {
			break;
		}
	}
	return {
		start: String(s).padStart(2, "0") + ":00",
		end: String(e).padStart(2, "0") + ":00",
	};
}

const Account = () => {
	const { logout: authLogout } = useAuth();
	const [currentView, setCurrentView] = useState<string>("main");

	const [notifications, setNotifications] = useState<NotificationViewItem[]>([]);
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [pairingCode, setPairingCode] = useState("");
	const [pushEnabled, setPushEnabled] = useState(true);
	const [activeHours, setActiveHours] = useState<number[]>([8, 9, 10]);
	const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>([]);
	const [validatingNotif, setValidatingNotif] = useState<{ id: string; userPlantId: number; nextStageOrder: number; plantName?: string; validationDescription?: string } | null>(null);
	const isValidatingRef = useRef(false);
	const unacknowledgedCount = notifications.filter((n) => !n.snoozed).length;

	useFocusEffect(
		useCallback(() => {
			if (!isValidatingRef.current) {
				setCurrentView("main");
			}
			const fetchData = () => {
				getNotifications(true)
					.then((res) => { if (res.data) setNotifications(res.data.map(apiNotifToView)); })
					.catch(console.error);
				getProfile()
					.then((res) => {
						if (res.data) {
							setName(res.data.name);
							setEmail(res.data.email);
							setPairingCode(res.data.pairing_code);
							setPushEnabled(res.data.push_enabled);
							if (res.data.notification_window_start && res.data.notification_window_end) {
								setActiveHours(parseTimeRangeToHours(res.data.notification_window_start, res.data.notification_window_end));
							}
						}
					})
					.catch(console.error);
			};
			fetchData();
			const interval = setInterval(fetchData, 15000);
			return () => clearInterval(interval);
		}, []),
	);

	const handleLogout = () => {
		authLogout();
	};

	const handleDismiss = async (id: string) => {
		try {
			await acknowledgeNotification(id);
			setNotifications((prev) => prev.filter((n) => n.id !== id));
		} catch (err) {
			Alert.alert("Fout", "Notificatie kon niet worden verwijderd.");
		}
	};

	const handleSnooze = async (id: string) => {
		try {
			await resetNotification(id);
			setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, snoozed: true } : n)));
		} catch (err) {
			Alert.alert("Fout", "Notificatie kon niet worden uitgesteld.");
		}
	};

	const handleConfirmPhaseUpdate = async () => {
		if (validatingNotif) {
			try {
				await advanceStage(validatingNotif.userPlantId, validatingNotif.nextStageOrder);
				await acknowledgeNotification(validatingNotif.id);
				setNotifications((prev) => prev.filter((n) => n.id !== validatingNotif.id));
			} catch (err) {
				Alert.alert("Fout", "De fase kon niet worden bijgewerkt. Probeer het later opnieuw.");
				return;
			}
		}
		isValidatingRef.current = false;
		setValidatingNotif(null);
		setCurrentView("main");
	};

	const handlePasswordChange = async (currentPassword: string, newPassword: string) => {
		await changePasswordApi(currentPassword, newPassword);
	};

	const handleNameChange = async (newName: string) => {
		await updateProfile({ name: newName });
		setName(newName);
	};

	const handlePushChange = async (val: boolean) => {
		await updateProfile({ push_enabled: val });
		setPushEnabled(val);
	};

	const handleActiveHoursChange = async (hours: number[]) => {
		const range = hoursToTimeRange(hours);
		await updateProfile({ notification_window_start: range.start, notification_window_end: range.end });
		setActiveHours(hours);
	};

	useEffect(() => {
		if (currentView === "notifications") {
			getNotifications(true)
				.then((res) => { if (res.data) setNotifications(res.data.map(apiNotifToView)); })
				.catch(console.error);
		}
		if (currentView === "history") {
			getNotifications(true)
				.then((res) => {
					if (res.data) {
						setHistoryEntries(
							res.data.map((n) => {
								const dt = n.created_at ? new Date(n.created_at) : new Date();
								return {
									id: n.id,
									date: dt.toLocaleDateString("nl-BE", { day: "2-digit", month: "2-digit", year: "numeric" }),
									time: dt.toLocaleTimeString("nl-BE", { hour: "2-digit", minute: "2-digit", hour12: false }),
									event: n.title + (n.description ? ` — ${n.description}` : ""),
									image: n.image ?? undefined,
								};
							}),
						);
					}
				})
				.catch(console.error);
		}
	}, [currentView]);

	switch (currentView) {
		case "main":
			return <AccountMain onNavigate={setCurrentView} onLogout={handleLogout} notificationCount={unacknowledgedCount} />;
		case "notifications":
			return <NotificationsView notifications={notifications} onBack={() => setCurrentView("main")} onDismiss={handleDismiss} onSnooze={handleSnooze} onValidate={(notifId, userPlantId, nextStageOrder, plantName, validationDescription) => { isValidatingRef.current = true; setValidatingNotif({ id: notifId, userPlantId, nextStageOrder, plantName, validationDescription }); setCurrentView("validate_step1"); }} />;
		case "validate_step1":
			return <ValidateStep1 plantName={validatingNotif?.plantName} validationDescription={validatingNotif?.validationDescription} onBack={() => { isValidatingRef.current = false; setValidatingNotif(null); setCurrentView("main"); }} onNext={() => setCurrentView("validate_step2")} />;
		case "validate_step2":
			return <ValidateStep2 plantName={validatingNotif?.plantName} onBack={() => setCurrentView("validate_step1")} onConfirm={handleConfirmPhaseUpdate} />;
		case "history":
			return <HistoryView entries={historyEntries} onBack={() => setCurrentView("main")} />;
		case "probes":
			return <ProbesView onBack={() => setCurrentView("main")} />;
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
