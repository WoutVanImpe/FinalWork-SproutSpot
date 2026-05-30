import { StyleSheet, TouchableOpacity, View } from "react-native";
import React from "react";
import { Styling } from "../../../../constants/Styling";
import StyledView from "../../../style/StyledView";
import StyledButton from "../../../style/StyledButton";
import StyledText from "../../../style/StyledText";
import StyledIcon from "../../../style/StyledIcon";
import Spacer from "../../../style/Spacer";
import AccountSvg from "../../../../assets/icons/account.svg";
import { BAR_MARGIN } from "../../../../constants/tabConfig";

interface AccountMainProps {
	onNavigate: (view: string) => void;
	onLogout: () => void;
	notificationCount?: number;
}

const AccountMain = ({ onNavigate, onLogout, notificationCount }: AccountMainProps) => (
	<StyledView>
		<View style={styles.mainContent}>
			<View style={styles.profileCircle}>
				<StyledIcon Icon={AccountSvg} size={150} fill={Styling.Colors.white} />
			</View>
			<Spacer space={Styling.Spacing.xxl} />
			<View style={styles.buttonStack}>
				<TouchableOpacity style={styles.fullWidth} onPress={() => onNavigate("notifications")}>
					<View style={styles.notifBtnRow}>
						<StyledButton fullCap style={styles.fullWidth}>
							Notificaties
						</StyledButton>
						{notificationCount !== undefined && notificationCount > 0 && (
							<View style={styles.notifBadge}>
								<StyledText style={styles.notifBadgeText}>{notificationCount > 9 ? "9+" : notificationCount}</StyledText>
							</View>
						)}
					</View>
				</TouchableOpacity>
				<TouchableOpacity style={styles.fullWidth} onPress={() => onNavigate("history")}>
					<StyledButton fullCap style={styles.fullWidth}>
						Historiek
					</StyledButton>
				</TouchableOpacity>
				<TouchableOpacity style={styles.fullWidth} onPress={() => onNavigate("probes")}>
					<StyledButton fullCap style={styles.fullWidth}>
						Mijn sondes
					</StyledButton>
				</TouchableOpacity>
				<TouchableOpacity style={styles.fullWidth} onPress={() => onNavigate("settings")}>
					<StyledButton fullCap style={styles.fullWidth}>
						Instellingen
					</StyledButton>
				</TouchableOpacity>
				<TouchableOpacity style={styles.fullWidth} onPress={onLogout}>
					<StyledButton fullCap style={styles.logoutButton}>
						Uitloggen
					</StyledButton>
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
		paddingHorizontal: BAR_MARGIN * 3,
	},
	fullWidth: {
		alignSelf: "stretch",
	},
	logoutButton: {
		alignSelf: "stretch",
		backgroundColor: Styling.Colors.red,
	},
	notifBtnRow: {
		flexDirection: "row",
		alignItems: "center",
		position: "relative",
		width: "100%",
	},
	notifBadge: {
		position: "absolute",
		right: 4,
		top: "50%",
		transform: [{ translateY: -9 }],
		minWidth: 18,
		height: 18,
		borderRadius: 9,
		backgroundColor: Styling.Colors.white,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 4,
	},
	notifBadgeText: {
		color: Styling.Colors.darkGrey,
		fontSize: 10,
		fontFamily: Styling.Fonts.Family.bold,
		lineHeight: 12,
	},
});
