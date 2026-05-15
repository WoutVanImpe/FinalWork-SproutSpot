import { Modal, StyleSheet, TouchableOpacity, View } from "react-native";
import React from "react";
import { StatusBar } from "expo-status-bar";
import { Styling } from "../../constants/Styling";
import CloseIcon from "../../assets/icons/close.svg";
import StyledIcon from "./StyledIcon";
import Spacer from "./Spacer";
import StyledText from "./StyledText";

export interface AlertButton {
	text: string;
	style?: "default" | "cancel" | "destructive";
	onPress?: () => void;
}

const StyledAlert = ({ visible, title, message, buttons, onDismiss, children, titleAlign }: { visible: boolean; title: string; message?: string; buttons?: AlertButton[]; onDismiss?: () => void; children?: React.ReactNode; titleAlign?: "left" | "center" }) => {
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
					<TouchableOpacity style={styles.closeBtn} onPress={() => onDismiss?.()}>
						<StyledIcon Icon={CloseIcon} size="reg" fill={Styling.Colors.white} />
					</TouchableOpacity>
					<StyledText type="head3" style={titleAlign === "left" ? { ...styles.title, textAlign: "left", paddingRight: 50 } : styles.title}>
						{title}
					</StyledText>
					{message ? (
						<>
							<Spacer space={Styling.Spacing.sml} />
							<StyledText type="paragh" style={styles.message}>
								{message}
							</StyledText>
						</>
					) : null}
					{children && <View style={styles.childrenContainer}>{children}</View>}
					<Spacer space={Styling.Spacing.med} />
					<View style={styles.buttonCol}>
						{(buttons?.length ? buttons : [{ text: "OK" }]).map((btn, i) => (
							<TouchableOpacity
								key={i}
								style={[
									styles.btn,
									btn.style === "destructive" && styles.btnDanger,
									btn.style === "cancel" && styles.btnCancel,
									i > 0 && { marginTop: Styling.Spacing.sml },
								]}
								onPress={() => handlePress(btn)}
							>
								<StyledText type="head4" style={btn.style === "cancel" ? styles.btnTextCancel : btn.style === "destructive" ? styles.btnTextDanger : styles.btnText}>
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
	closeBtn: {
		position: "absolute",
		top: Styling.Padding.reg,
		right: Styling.Padding.reg,
		zIndex: 1,
		width: 32,
		height: 32,
		borderRadius: 16,
		backgroundColor: Styling.Colors.green,
		justifyContent: "center",
		alignItems: "center",
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
	childrenContainer: {
		marginTop: Styling.Spacing.sml,
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
