import { StyleSheet, Text, ViewStyle, View } from "react-native";
import React from "react";
import { Styling } from "../../../constants/Styling";
import { Link } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BAR_MARGIN } from "../../../constants/tabConfig";
import AccountIcon from "../../../assets/icons/account.svg";
import StyledIcon from "../../style/StyledIcon";

const NavHeader = ({ style, ...props }: { style?: ViewStyle }) => {
	const insets = useSafeAreaInsets();

	return (
		<View style={[styles.wrapper, { top: insets.top }, style]}>
			<Link href="/" {...props}>
				<Text style={styles.logo}>SproutSpot</Text>
			</Link>
			<Link href="/account">
            <StyledIcon Icon={AccountIcon} size="med"/>
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
});
