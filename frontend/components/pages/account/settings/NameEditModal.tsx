import { StyleSheet, TextInput } from "react-native";
import React from "react";
import { Styling } from "../../../../constants/Styling";
import StyledAlert from "../../../style/StyledAlert";
import Spacer from "../../../style/Spacer";

interface NameEditModalProps {
	visible: boolean;
	nameDraft: string;
	onNameDraftChange: (name: string) => void;
	onSave: () => void;
	onDismiss: () => void;
}

const NameEditModal = ({ visible, nameDraft, onNameDraftChange, onSave, onDismiss }: NameEditModalProps) => (
	<StyledAlert
		visible={visible}
		title="Naam wijzigen"
		titleAlign="left"
		onDismiss={onDismiss}
		buttons={[{ text: "Opslaan", style: "default", onPress: onSave }]}
	>
		<Spacer space={Styling.Spacing.reg} />
		<TextInput
			style={styles.modalInput}
			value={nameDraft}
			onChangeText={onNameDraftChange}
			placeholder="Je naam"
			placeholderTextColor={Styling.Colors.darkGrey}
		/>
		<Spacer space={Styling.Spacing.reg} />
	</StyledAlert>
);

export default NameEditModal;

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
