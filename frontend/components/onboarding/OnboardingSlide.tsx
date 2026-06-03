import { Image, StyleSheet, TouchableOpacity, View, useWindowDimensions } from "react-native";
import React from "react";
import { Styling } from "../../constants/Styling";
import { scaled } from "../../constants/scale";
import StyledText from "../style/StyledText";
import StyledButton from "../style/StyledButton";
import { OnboardingSlide as OnboardingSlideData } from "../../data/onboardingSlides";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Spacer from "../style/Spacer";

const OnboardingSlide = ({ slide, onComplete }: { slide: OnboardingSlideData; onComplete: () => void }) => {
	const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
	const insets = useSafeAreaInsets();

	const positionStyles: Record<string, object> = {
		topLeft: { top: 0, left: scaled(24), alignItems: "flex-start" as const },
		topRight: { top: scaled(100), right: scaled(24), alignItems: "flex-end" as const },
		bottomLeft: { bottom: scaled(120), left: scaled(24), alignItems: "flex-start" as const },
		topCenter: { top: scaled(110), left: 0, right: 0, alignItems: "center" as const, maxWidth: SCREEN_WIDTH },
	};

	const textAlignStyles: Record<string, object> = {
		topLeft: {},
		topRight: { textAlign: "right" as const },
		bottomLeft: {},
		topCenter: { textAlign: "center" as const, paddingHorizontal: scaled(40), width: "100%" as const },
	};

	const buttonVisibility: Record<string, boolean> = {
		topLeft: false,
		topRight: false,
		bottomLeft: false,
		topCenter: true,
	};

	return (
		<>
			<Image source={slide.bg} style={[styles.bgImage, { width: SCREEN_WIDTH, height: SCREEN_HEIGHT }]} resizeMode="cover" />
			<View style={[styles.textOverlay, { maxWidth: SCREEN_WIDTH - scaled(48) }, positionStyles[slide.position], slide.position === "topLeft" && { top: insets.top + scaled(45) }]}>
				<StyledText type="head1" fullCap style={[styles.title, textAlignStyles[slide.position]]}>
					{slide.title}
				</StyledText>
				<StyledText type="paragh" style={[styles.description, textAlignStyles[slide.position]]}>
					{slide.text}
				</StyledText>
				{buttonVisibility[slide.position] && (
					<>
						<Spacer space={Styling.Spacing.reg} />
						<TouchableOpacity onPress={onComplete} activeOpacity={0.8}>
							<StyledButton>Begin nu!</StyledButton>
						</TouchableOpacity>
					</>
				)}
			</View>
		</>
	);
};

export default OnboardingSlide;

const styles = StyleSheet.create({
	bgImage: {
		position: "absolute",
		top: 0,
		left: 0,
	},
	textOverlay: {
		position: "absolute",
	},
	title: {
		color: Styling.Colors.green,
		marginBottom: 8,
		width: "80%",
	},
	description: {
		color: "rgba(255,255,255,0.85)",
		lineHeight: 20,
		width: "80%",
	},
});


