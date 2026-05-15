import React, { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import TomatoImg from "../../assets/vegetables/tomato.png";
import CabbageImg from "../../assets/vegetables/cabbage.png";

import AccountMain from "../../components/pages/account/main/AccountMain";
import NotificationsView from "../../components/pages/account/notifications/NotificationsView";
import type { NotificationItem } from "../../components/pages/account/notifications/NotificationsView";
import ValidateStep1 from "../../components/pages/account/validate/ValidateStep1";
import ValidateStep2 from "../../components/pages/account/validate/ValidateStep2";
import HistoryView from "../../components/pages/account/history/HistoryView";
import type { HistoryEntry } from "../../components/pages/account/history/HistoryView";
import SettingsView from "../../components/pages/account/settings/SettingsView";

const Account = () => {
	const [currentView, setCurrentView] = useState<string>("main");

	useFocusEffect(
		useCallback(() => {
			setCurrentView("main");
		}, [])
	);

	const [notifications, setNotifications] = useState<NotificationItem[]>([
		{ id: "n1", type: "problem", title: "Tomaat Toby", description: "De grond is te droog. Geef direct water totdat het water uit de drainagegaten loopt.", image: TomatoImg },
		{ id: "n2", type: "milestone", title: "Tomaat Toby", description: "Nieuw groeistadium bereikt! Tijd om te valideren of de plant klaar is voor de volgende stap.", image: TomatoImg },
		{ id: "n3", type: "problem", title: "Basilicum Bella", description: "Verplaats de plant naar een plek met meer direct zonlicht.", image: TomatoImg },
	]);

	const [pushEnabled, setPushEnabled] = useState(true);
	const [reminderMorning, setReminderMorning] = useState(true);
	const [reminderEvening, setReminderEvening] = useState(false);

	const [historyEntries] = useState<HistoryEntry[]>([
		{ id: "h1", date: "14/05", time: "15:30", event: "Te droog: Tomaat Toby water gegeven", image: TomatoImg },
		{ id: "h2", date: "14/05", time: "09:15", event: 'Groeistadium: Tomaat Toby naar "Groeispurt"', image: TomatoImg },
		{ id: "h3", date: "13/05", time: "20:00", event: "Te donker: Basilicum Bella verplaatst", image: CabbageImg },
		{ id: "h4", date: "13/05", time: "12:45", event: "Water bijgevuld: Munt Molly", image: CabbageImg },
		{ id: "h5", date: "12/05", time: "18:30", event: "Batterij: Probe Tomaat op 15%", image: TomatoImg },
		{ id: "h6", date: "11/05", time: "07:00", event: "Te warm: Tomaat Toby uit direct zonlicht gehaald", image: TomatoImg },
		{ id: "h7", date: "10/05", time: "14:00", event: "Meststof toegevoegd: Paprika Pablo", image: CabbageImg },
		{ id: "h8", date: "09/05", time: "08:30", event: "Verpot: Munt Molly naar grotere pot", image: CabbageImg },
	]);

	const handleLogout = () => {};

	const handleDismiss = (id: string) => {
		setNotifications((prev) => prev.filter((n) => n.id !== id));
	};

	const handleSnooze = (id: string) => {
		setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, snoozed: true } : n)));
	};

	const handleConfirmPhaseUpdate = () => {
		setCurrentView("main");
	};

	switch (currentView) {
		case "main":
			return <AccountMain onNavigate={setCurrentView} onLogout={handleLogout} />;
		case "notifications":
			return (
				<NotificationsView
					notifications={notifications}
					onBack={() => setCurrentView("main")}
					onDismiss={handleDismiss}
					onSnooze={handleSnooze}
					onValidate={() => setCurrentView("validate_step1")}
				/>
			);
		case "validate_step1":
			return (
				<ValidateStep1
					onBack={() => setCurrentView("notifications")}
					onNext={() => setCurrentView("validate_step2")}
				/>
			);
		case "validate_step2":
			return (
				<ValidateStep2
					onBack={() => setCurrentView("validate_step1")}
					onConfirm={handleConfirmPhaseUpdate}
				/>
			);
		case "history":
			return <HistoryView entries={historyEntries} onBack={() => setCurrentView("main")} />;
		case "settings":
			return (
				<SettingsView
					onBack={() => setCurrentView("main")}
					pushEnabled={pushEnabled}
					onPushChange={setPushEnabled}
					reminderMorning={reminderMorning}
					onMorningChange={setReminderMorning}
					reminderEvening={reminderEvening}
					onEveningChange={setReminderEvening}
				/>
			);
		default:
			return <AccountMain onNavigate={setCurrentView} onLogout={handleLogout} />;
	}
};

export default Account;
