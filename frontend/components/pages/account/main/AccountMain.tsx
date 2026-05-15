import { StyleSheet, TouchableOpacity, View } from "react-native";
import React from "react";
import { Styling } from "../../../../constants/Styling";
import StyledView from "../../../style/StyledView";
import StyledText from "../../../style/StyledText";
import StyledIcon from "../../../style/StyledIcon";
import Spacer from "../../../style/Spacer";
import AccountSvg from "../../../../assets/icons/account.svg";

interface AccountMainProps {
	onNavigate: (view: string) => void;
	onLogout: () => void;
}

const AccountMain = ({ onNavigate, onLogout }: AccountMainProps) => (
	<StyledView>
		<View style={styles.mainContent}>
			<View style={styles.profileCircle}>
				<StyledIcon Icon={AccountSvg} size={150} fill={Styling.Colors.white} />
			</View>
			<Spacer space={Styling.Spacing.xxl} />
			<View style={styles.buttonStack}>
				<TouchableOpacity style={styles.pillButton} onPress={() => onNavigate("notifications")}>
					<StyledText type="head4" fullCap style={styles.pillButtonText}>
						Notificaties
					</StyledText>
				</TouchableOpacity>
				<TouchableOpacity style={styles.pillButton} onPress={() => onNavigate("history")}>
					<StyledText type="head4" fullCap style={styles.pillButtonText}>
						Historiek
					</StyledText>
				</TouchableOpacity>
				<TouchableOpacity style={styles.pillButton} onPress={() => onNavigate("settings")}>
					<StyledText type="head4" fullCap style={styles.pillButtonText}>
						Instellingen
					</StyledText>
				</TouchableOpacity>
				<TouchableOpacity style={[styles.pillButton, styles.logoutButton]} onPress={onLogout}>
					<StyledText type="head4" fullCap style={styles.logoutText}>
						Uitloggen
					</StyledText>
				</TouchableOpacity>
			</View>
		</View>
	</StyledView>
);

export default AccountMain;

const styles = StyleSheet.create({
	mainContent: {
		flex: 1,
		width: "100%",
		justifyContent: "flex-start",
		alignItems: "center",
		padding: 0,
	},
	profileCircle: {
		justifyContent: "center",
		alignItems: "center",
	},
	buttonStack: {
		width: "100%",
		gap: Styling.Spacing.lrg,
	},
	pillButton: {
		width: "100%",
		backgroundColor: Styling.Colors.green,
		paddingVertical: Styling.Padding.sml,
		alignSelf: "stretch",
		borderRadius: Styling.BorderRadius.reg,
		alignItems: "center",
	},
	pillButtonText: {
		color: Styling.Colors.white,
	},
	logoutButton: {
		width: "100%",
		backgroundColor: Styling.Colors.red,
		paddingVertical: Styling.Padding.sml,
		alignSelf: "stretch",
		borderRadius: Styling.BorderRadius.reg,
		alignItems: "center",
	},
	logoutText: {
		color: Styling.Colors.white,
	},
});
