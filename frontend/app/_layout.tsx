import { StyleSheet, View, TouchableOpacity, Dimensions } from "react-native";
import React from "react";
import { Tabs, usePathname } from "expo-router";
import { useFonts } from "expo-font";
import { Styling } from "../constants/Styling";
import StyledIcon from "../components/style/StyledIcon";
import HomeIcon from "../assets/icons/home.svg";
import GardenIcon from "../assets/icons/garden.svg";
import ExploreIcon from "../assets/icons/explore.svg";
import { StatusBar } from "expo-status-bar";

const { width } = Dimensions.get("window");
const BAR_MARGIN = 20;
const BAR_WIDTH = width - BAR_MARGIN * 2;

const TabButton = ({ item, route, onPress }: any) => {
	const pathname = usePathname();

	const focused = (route === "/" && pathname === "/") || (route !== "/" && pathname.includes(route));

	return (
		<>
			<StatusBar style="light" />
			<TouchableOpacity onPress={onPress} activeOpacity={1} style={styles.tabContainer}>
				<View style={[focused ? styles.activeBtn : styles.inactiveBtn, { zIndex: focused ? 10 : 1 }]}>
					{focused && <View style={styles.focusedCircle} />}

					<StyledIcon Icon={item.icon} fill={focused ? Styling.Colors.white : Styling.Colors.lightGrey} size="med" />
				</View>
			</TouchableOpacity>
		</>
	);
};

const Footer = () => {
	const [fontsLoaded] = useFonts({
		"SpaceGrotesk-Regular": require("../assets/fonts/SpaceGrotesk-Regular.ttf"),
		"SpaceGrotesk-Bold": require("../assets/fonts/SpaceGrotesk-Bold.ttf"),
	});

	if (!fontsLoaded) return null;

	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarShowLabel: false,
				tabBarStyle: styles.navbar,
				tabBarItemStyle: {
					height: 70,
				},
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					tabBarButton: (props) => <TabButton {...props} route="/" item={{ icon: HomeIcon }} />,
				}}
			/>
			<Tabs.Screen
				name="(garden)/garden"
				options={{
					tabBarButton: (props) => <TabButton {...props} route="garden" item={{ icon: GardenIcon }} />,
				}}
			/>
			<Tabs.Screen
				name="(explore)/explore"
				options={{
					tabBarButton: (props) => <TabButton {...props} route="explore" item={{ icon: ExploreIcon }} />,
				}}
			/>
			<Tabs.Screen name="(account)/account" options={{ href: null }} />
		</Tabs>
	);
};

const styles = StyleSheet.create({
	navbar: {
		position: "absolute",
		bottom: 25,
		transform: [{ translateX: BAR_MARGIN }],
		width: BAR_WIDTH,

		paddingHorizontal: 30,

		backgroundColor: Styling.Colors.white,
		borderRadius: Styling.BorderRadius.med,
		height: 70,
		elevation: 5,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 10 },
		shadowOpacity: 0.1,
		shadowRadius: 10,
		borderTopWidth: 0,
		paddingBottom: 0,
		overflow: "visible",
		zIndex: 100,
	},
	tabContainer: {
		flex: 1,
		height: 70,
		justifyContent: "center",
		alignItems: "center",
	},
	inactiveBtn: {
		flex: 1,
		width: "100%",
		justifyContent: "center",
		alignItems: "center",
	},
	activeBtn: {
		width: 60,
		height: 60,
		justifyContent: "center",
		alignItems: "center",
		top: -30,
	},
	focusedCircle: {
		position: "absolute",
		width: 60,
		height: 60,
		borderRadius: 30,
		backgroundColor: Styling.Colors.green,
		elevation: 8,
		shadowColor: Styling.Colors.green,
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 5,
	},
});

export default Footer;
