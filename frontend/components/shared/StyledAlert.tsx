import { Modal, StyleSheet, TouchableOpacity, View } from "react-native";
import React from "react";
import { StatusBar } from "expo-status-bar";
import { Styling } from "../../constants/Styling";
import Spacer from "../style/Spacer";
import StyledText from "../style/StyledText";

export interface AlertButton {
	text: string;
	style?: "default" | "cancel" | "destructive";
	onPress?: () => void;
}

const StyledAlert = ({
	visible,
	title,
	message,
	buttons,
	onDismiss,
}: {
	visible: boolean;
	title: string;
	message: string;
	buttons?: AlertButton[];
	onDismiss?: () => void;
}) => {
	if (!visible) return null;

	const handlePress = (btn?: AlertButton) => {
		btn?.onPress?.();
		onDismiss?.();
	};

	return (
		<Modal visible={visible} transparent animationType="fade" onRequestClose={() => handlePress()}>
			<StatusBar style="light" />
			<View style={styles.backdrop}>
				<View style={styles.card}>
					<StyledText type="head3" style={styles.title}>
						{title}
					</StyledText>
					<Spacer space={Styling.Spacing.sml} />
					<StyledText type="paragh" style={styles.message}>
						{message}
					</StyledText>
					<Spacer space={Styling.Spacing.med} />
					<View style={[styles.buttonRow, (buttons?.length ?? 1) > 2 && styles.buttonCol]}>
						{(buttons?.length ? buttons : [{ text: "OK" }]).map((btn, i) => (
							<TouchableOpacity
								key={i}
								style={[
									styles.btn,
									(buttons?.length ?? 1) <= 2 && styles.btnRowFlex,
									btn.style === "destructive" && styles.btnDanger,
									btn.style === "cancel" && styles.btnCancel,
									(buttons?.length ?? 1) <= 2 && i > 0 && { marginLeft: Styling.Spacing.sml },
									(buttons?.length ?? 1) > 2 && i > 0 && { marginTop: Styling.Spacing.sml },
								]}
								onPress={() => handlePress(btn)}
							>
								<StyledText
									type="head4"
									style={[
										styles.btnText,
										btn.style === "destructive" && styles.btnTextDanger,
										btn.style === "cancel" && styles.btnTextCancel,
									]}
								>
									{btn.text}
								</StyledText>
							</TouchableOpacity>
						))}
					</View>
				</View>
			</View>
		</Modal>
	);
};

export default StyledAlert;

const styles = StyleSheet.create({
	backdrop: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.45)",
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 40,
	},
	card: {
		backgroundColor: Styling.Colors.white,
		borderRadius: 20,
		paddingHorizontal: 25,
		paddingVertical: Styling.Padding.lrg,
		width: "100%",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.15,
		shadowRadius: 12,
		elevation: 8,
	},
	title: {
		color: Styling.Colors.green,
		textAlign: "center",
	},
	message: {
		color: Styling.Colors.darkGrey,
		textAlign: "center",
		lineHeight: 20,
	},
	buttonRow: {
		flexDirection: "row",
		justifyContent: "center",
	},
	buttonCol: {
		flexDirection: "column",
	},
	btn: {
		backgroundColor: Styling.Colors.green,
		paddingVertical: Styling.Padding.sml,
		paddingHorizontal: Styling.Padding.lrg,
		borderRadius: Styling.BorderRadius.reg,
		alignItems: "center",
		justifyContent: "center",
	},
	btnRowFlex: {
		flex: 1,
	},
	btnDanger: {
		backgroundColor: Styling.Colors.red,
	},
	btnCancel: {
		backgroundColor: "transparent",
		borderWidth: 1,
		borderColor: Styling.Colors.green,
	},
	btnText: {
		color: Styling.Colors.white,
	},
	btnTextDanger: {
		color: Styling.Colors.white,
	},
	btnTextCancel: {
		color: Styling.Colors.green,
	},
});
