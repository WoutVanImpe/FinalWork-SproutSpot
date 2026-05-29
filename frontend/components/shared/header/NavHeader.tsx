import { StyleSheet, Text, ViewStyle, View } from "react-native";
import React, { useState, useEffect } from "react";
import { Styling } from "../../../constants/Styling";
import { Link, useSegments } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BAR_MARGIN } from "../../../constants/tabConfig";
import AccountIcon from "../../../assets/icons/account.svg";
import StyledIcon from "../../style/StyledIcon";
import StyledText from "../../style/StyledText";
import { getNotificationCount } from "../../../services/notifications";

const NavHeader = ({ style, ...props }: { style?: ViewStyle }) => {
	const insets = useSafeAreaInsets();
	const segments = useSegments();
	const [count, setCount] = useState(0);

	useEffect(() => {
		getNotificationCount()
			.then((res) => setCount(res.data?.count ?? 0))
			.catch(() => setCount(0));
	}, [segments]);

	return (
		<View style={[styles.wrapper, { top: insets.top }, style]}>
			<Link href="/" {...props}>
				<Text style={styles.logo}>SproutSpot</Text>
			</Link>
			<Link href="/account">
				<View style={styles.accountBtn}>
					<StyledIcon Icon={AccountIcon} size="med" />
					{count > 0 && (
						<View style={styles.badge}>
							<StyledText style={styles.badgeText}>{count > 9 ? "9+" : count}</StyledText>
						</View>
					)}
				</View>
			</Link>
		</View>
	);
};

export default NavHeader;

const styles = StyleSheet.create({
	wrapper: {
		position: "absolute",
		zIndex: 99,
		left: 0,
        
        width: "100%",

		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "stretch",

		paddingHorizontal: BAR_MARGIN,
        paddingTop: 20,
	},
	logo: {
		color: Styling.Colors.white,
		fontFamily: Styling.Fonts.Family.bold,
		fontSize: Styling.Fonts.Size.lrg,
	},
	accountBtn: {
		position: "relative",
	},
	badge: {
		position: "absolute",
		top: -4,
		right: -6,
		minWidth: 18,
		height: 18,
		borderRadius: 9,
		backgroundColor: Styling.Colors.red,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 4,
	},
	badgeText: {
		color: Styling.Colors.white,
		fontSize: 10,
		fontFamily: Styling.Fonts.Family.bold,
		lineHeight: 12,
	},
});
