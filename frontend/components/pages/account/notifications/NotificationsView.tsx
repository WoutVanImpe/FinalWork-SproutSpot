import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import React from "react";
import { Styling } from "../../../../constants/Styling";
import StyledView from "../../../style/StyledView";
import StyledText from "../../../style/StyledText";
import Spacer from "../../../style/Spacer";
import AccountHeader from "../header/AccountHeader";

export interface NotificationItem {
	id: string;
	type: "problem" | "milestone";
	title: string;
	description: string;
	image: number | { uri: string } | null;
	snoozed?: boolean;
}

interface NotificationsViewProps {
	notifications: NotificationItem[];
	onBack: () => void;
	onDismiss: (id: string) => void;
	onSnooze: (id: string) => void;
	onValidate: () => void;
}

const NotificationsView = ({ notifications, onBack, onDismiss, onSnooze, onValidate }: NotificationsViewProps) => (
	<StyledView safe={false}>
		<AccountHeader title="Notificaties" onBack={onBack} />
		<Spacer space={Styling.Spacing.med}/>
		<ScrollView contentContainerStyle={styles.scrollContent}>
			{notifications.filter((n) => !n.snoozed).length === 0 ? (
				<StyledText type="paragh" style={styles.emptyText}>
					Geen notificaties
				</StyledText>
			) : (
				notifications
					.filter((n) => !n.snoozed)
					.map((item) => (
							<View key={item.id} style={styles.notificationCard}>
							<View style={styles.notificationRow}>
								{item.image ? <Image source={item.image} style={styles.plantThumb} resizeMode="contain" /> : <View style={[styles.plantThumb, { backgroundColor: Styling.Colors.lightGrey }]} />}
								<View style={styles.notificationInfo}>
									<StyledText type="head3" style={styles.cardTitle}>
										{item.title}
									</StyledText>
									<StyledText type="paragh" style={styles.cardDescription}>
										{item.description}
									</StyledText>
								</View>
							</View>
							<Spacer space={Styling.Spacing.sml} />
							{item.type === "problem" ? (
								<View style={styles.cardActions}>
									<TouchableOpacity style={styles.notifActionButton} onPress={() => onSnooze(item.id)}>
										<StyledText type="head4" fullCap style={styles.notifActionOutlineText}>
											Herinner mij
										</StyledText>
									</TouchableOpacity>
									<TouchableOpacity style={styles.notifActionButtonFilled} onPress={() => onDismiss(item.id)}>
										<StyledText type="head4" fullCap style={styles.notifActionFilledText}>
											In orde
										</StyledText>
									</TouchableOpacity>
								</View>
							) : (
								<TouchableOpacity style={styles.notifActionButtonFilled} onPress={onValidate}>
									<StyledText type="head4" fullCap style={styles.notifActionFilledText}>
										Valideer
									</StyledText>
								</TouchableOpacity>
							)}
						</View>
					))
			)}
		</ScrollView>
	</StyledView>
);

export default NotificationsView;

const styles = StyleSheet.create({
	scrollContent: {
		paddingTop: Styling.Padding.sml,
		width: "100%",
		padding: 0,
		paddingBottom: 120,
	},
	emptyText: {
		color: Styling.Colors.lightGrey,
		textAlign: "center",
		marginTop: Styling.Spacing.xlg,
	},
	notificationCard: {
		width: "100%",
		backgroundColor: Styling.Colors.white,
		borderRadius: Styling.BorderRadius.reg,
		padding: Styling.Padding.med,
		marginBottom: Styling.Spacing.reg,
	},
	notificationRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: Styling.Spacing.sml,
	},
	plantThumb: {
		width: 64,
		height: 64,
		borderRadius: Styling.BorderRadius.sml,
		marginRight: Styling.Spacing.sml,
	},
	notificationInfo: {
		flex: 1,
	},
	cardTitle: {
		color: Styling.Colors.green,
	},
	cardDescription: {
		color: Styling.Colors.darkGrey,
		marginTop: Styling.Spacing.xsm,
		lineHeight: 20,
	},
	cardActions: {
		flexDirection: "row",
		gap: Styling.Spacing.sml,
	},
	notifActionButton: {
		flex: 1,
		paddingVertical: Styling.Padding.sml,
		borderRadius: Styling.BorderRadius.reg,
		backgroundColor: Styling.Colors.white,
		borderWidth: 1,
		borderColor: Styling.Colors.green,
		alignItems: "center",
	},
	notifActionOutlineText: {
		color: Styling.Colors.green,
	},
	notifActionButtonFilled: {
		flex: 1,
		paddingVertical: Styling.Padding.sml,
		borderRadius: Styling.BorderRadius.reg,
		backgroundColor: Styling.Colors.green,
		alignItems: "center",
	},
	notifActionFilledText: {
		color: Styling.Colors.white,
	},
});
