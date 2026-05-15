import { StyleSheet, TextInput } from "react-native";
import React from "react";
import { Styling } from "../../../../constants/Styling";
import StyledAlert from "../../../style/StyledAlert";
import Spacer from "../../../style/Spacer";

interface PasswordEditModalProps {
	visible: boolean;
	currentPw: string;
	newPw: string;
	onCurrentPwChange: (pw: string) => void;
	onNewPwChange: (pw: string) => void;
	onSave: () => void;
	onDismiss: () => void;
}

const PasswordEditModal = ({ visible, currentPw, newPw, onCurrentPwChange, onNewPwChange, onSave, onDismiss }: PasswordEditModalProps) => (
	<StyledAlert
		visible={visible}
		title="Wachtwoord wijzigen"
		titleAlign="left"
		onDismiss={onDismiss}
		buttons={[{ text: "Opslaan", style: "default", onPress: onSave }]}
	>
		<Spacer space={Styling.Spacing.reg} />
		<TextInput
			style={styles.modalInput}
			value={currentPw}
			onChangeText={onCurrentPwChange}
			placeholder="Huidig wachtwoord"
			secureTextEntry
			placeholderTextColor={Styling.Colors.darkGrey}
		/>
		<Spacer space={Styling.Spacing.reg} />
		<TextInput
			style={styles.modalInput}
			value={newPw}
			onChangeText={onNewPwChange}
			placeholder="Nieuw wachtwoord"
			secureTextEntry
			placeholderTextColor={Styling.Colors.darkGrey}
		/>
		<Spacer space={Styling.Spacing.reg} />
	</StyledAlert>
);

export default PasswordEditModal;

const styles = StyleSheet.create({
	modalInput: {
		color: Styling.Colors.black,
		borderBottomWidth: 1,
		borderBottomColor: Styling.Colors.green,
		fontFamily: Styling.Fonts.Family.reg,
		fontSize: Styling.Fonts.Size.reg,
		paddingVertical: Styling.Padding.xsm,
	},
});
