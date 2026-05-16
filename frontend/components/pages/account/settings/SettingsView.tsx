import { ScrollView, StyleSheet, Switch, TouchableOpacity, View } from "react-native";
import React, { useState } from "react";
import { Styling } from "../../../../constants/Styling";
import StyledView from "../../../style/StyledView";
import StyledText from "../../../style/StyledText";
import Spacer from "../../../style/Spacer";
import AccountHeader from "../header/AccountHeader";
import NameEditModal from "./NameEditModal";
import PasswordEditModal from "./PasswordEditModal";
import TimeSlotsModal, { formatActiveHours } from "./TimeSlotsModal";

interface SettingsViewProps {
	onBack: () => void;
	name: string;
	email: string;
	pairingCode: string;
	pushEnabled: boolean;
	activeHours: number[];
	onNameChange: (name: string) => void;
	onPasswordChange: (currentPassword: string, newPassword: string) => void;
	onPushChange: (value: boolean) => void;
	onActiveHoursChange: (hours: number[]) => void;
}

const SettingsView = ({ onBack, name, email, pairingCode, pushEnabled, activeHours, onNameChange, onPasswordChange, onPushChange, onActiveHoursChange }: SettingsViewProps) => {
	const [nameModal, setNameModal] = useState(false);
	const [nameDraft, setNameDraft] = useState("");

	const [passwordModal, setPasswordModal] = useState(false);
	const [currentPw, setCurrentPw] = useState("");
	const [newPw, setNewPw] = useState("");

	const [timeModal, setTimeModal] = useState(false);
	const [draftHours, setDraftHours] = useState<number[]>([]);

	const openNameModal = () => { setNameDraft(name); setNameModal(true); };
	const openPasswordModal = () => { setCurrentPw(""); setNewPw(""); setPasswordModal(true); };
	const openTimeModal = () => { setDraftHours([...activeHours]); setTimeModal(true); };

	const toggleHour = (hour: number) => {
		setDraftHours((prev) => (prev.includes(hour) ? prev.filter((h) => h !== hour) : [...prev, hour]));
	};

	return (
		<StyledView>
			<AccountHeader title="Instellingen" onBack={onBack} />
			<Spacer space={Styling.Spacing.med} />
			<ScrollView contentContainerStyle={styles.scrollContent}>
				<StyledText type="head3" style={styles.subheader}>Account</StyledText>
				<Spacer space={Styling.Spacing.sml} />

				<View style={styles.settingRow}>
					<StyledText type="paragh" style={styles.settingLabel}>Naam</StyledText>
					<View style={styles.editRow}>
						<StyledText type="paragh" style={styles.settingValue}>{name}</StyledText>
						<TouchableOpacity onPress={openNameModal}>
							<StyledText type="smParagh" style={styles.changeText}>Wijzig</StyledText>
						</TouchableOpacity>
					</View>
				</View>

				<View style={styles.settingRow}>
					<StyledText type="paragh" style={styles.settingLabel}>E-mail</StyledText>
					<StyledText type="paragh" style={styles.settingValue}>{email}</StyledText>
				</View>

				<View style={styles.settingRow}>
					<StyledText type="paragh" style={styles.settingLabel}>Wachtwoord</StyledText>
					<View style={styles.editRow}>
						<StyledText type="paragh" style={styles.settingValue}>*****</StyledText>
						<TouchableOpacity onPress={openPasswordModal}>
							<StyledText type="smParagh" style={styles.changeText}>Wijzig</StyledText>
						</TouchableOpacity>
					</View>
				</View>

				<View style={styles.settingRow}>
					<StyledText type="paragh" style={styles.settingLabel}>Pairing Code</StyledText>
					<StyledText type="paragh" style={styles.settingValue}>{pairingCode}</StyledText>
				</View>

				<Spacer space={Styling.Spacing.xlg} />
				<StyledText type="head3" style={styles.subheader}>Meldingen</StyledText>

				<View style={styles.settingRow}>
					<StyledText type="paragh" style={styles.settingLabel}>Push notificaties</StyledText>
					<Switch value={pushEnabled} onValueChange={onPushChange} trackColor={{ false: Styling.Colors.lightGrey, true: Styling.Colors.green }} thumbColor={Styling.Colors.white} />
				</View>

				<Spacer space={Styling.Spacing.reg} />
				<View style={styles.settingRow}>
					<StyledText type="paragh" style={styles.settingLabel}>Tijdsvensters</StyledText>
					<View style={styles.editRow}>
						<StyledText type="paragh" style={styles.settingValue}>{formatActiveHours(activeHours)}</StyledText>
						<TouchableOpacity onPress={openTimeModal}>
							<StyledText type="smParagh" style={styles.changeText}>Wijzig</StyledText>
						</TouchableOpacity>
					</View>
				</View>
			</ScrollView>

			<NameEditModal
				visible={nameModal}
				nameDraft={nameDraft}
				onNameDraftChange={setNameDraft}
				onSave={() => { onNameChange(nameDraft); setNameModal(false); }}
				onDismiss={() => setNameModal(false)}
			/>

			<PasswordEditModal
				visible={passwordModal}
				currentPw={currentPw}
				newPw={newPw}
				onCurrentPwChange={setCurrentPw}
				onNewPwChange={setNewPw}
				onSave={() => { onPasswordChange(currentPw, newPw); setPasswordModal(false); }}
				onDismiss={() => setPasswordModal(false)}
			/>

			<TimeSlotsModal
				visible={timeModal}
				draftHours={draftHours}
				onToggleHour={toggleHour}
				onSave={() => { onActiveHoursChange(draftHours); setTimeModal(false); }}
				onDismiss={() => setTimeModal(false)}
			/>
		</StyledView>
	);
};

export default SettingsView;

const styles = StyleSheet.create({
	scrollContent: {
		paddingTop: Styling.Padding.sml,
		width: "100%",
		padding: 0,
		paddingBottom: 120,
	},
	subheader: {
		color: Styling.Colors.white,
	},
	settingRow: {
		width: "100%",
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingVertical: Styling.Padding.sml,
		borderBottomWidth: 1,
		borderBottomColor: Styling.Colors.lightGrey,
	},
	settingLabel: {
		color: Styling.Colors.white,
		flex: 1,
	},
	settingValue: {
		color: Styling.Colors.white,
	},
	editRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: Styling.Spacing.sml,
	},
	changeText: {
		color: Styling.Colors.green,
	},
});
