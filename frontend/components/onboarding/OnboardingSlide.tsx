import { Dimensions, Image, StyleSheet, TouchableOpacity, View } from "react-native";
import React from "react";
import { Styling } from "../../constants/Styling";
import StyledText from "../style/StyledText";
import StyledButton from "../style/StyledButton";
import { OnboardingSlide as OnboardingSlideData } from "../../data/onboardingSlides";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Spacer from "../style/Spacer";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const positionStyles: Record<OnboardingSlideData["position"], object> = {
	topLeft: { top: 0, left: 24, alignItems: "flex-start" as const },
	topRight: { top: 100, right: 24, alignItems: "flex-end" as const },
	bottomLeft: { bottom: 120, left: 24, alignItems: "flex-start" as const },
	topCenter: { top: 110, left: 0, right: 0, alignItems: "center" as const, maxWidth: SCREEN_WIDTH },
};

const textAlignStyles: Record<OnboardingSlideData["position"], object> = {
	topLeft: {},
	topRight: { textAlign: "right" as const },
	bottomLeft: {},
	topCenter: { textAlign: "center" as const, paddingHorizontal: 40, width: "100%" as const },
};

const buttonVisibility: Record<OnboardingSlideData["position"], boolean> = {
	topLeft: false,
	topRight: false,
	bottomLeft: false,
	topCenter: true,
};

const OnboardingSlide = ({ slide, onComplete }: { slide: OnboardingSlideData; onComplete: () => void }) => {
	const insets = useSafeAreaInsets();
	return (
		<>
			<Image source={slide.bg} style={styles.bgImage} resizeMode="cover" />
			<View style={[styles.textOverlay, positionStyles[slide.position], slide.position === "topLeft" && { top: insets.top + 45 }]}>
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
		width: SCREEN_WIDTH,
		height: SCREEN_HEIGHT,
		position: "absolute",
		top: 0,
		left: 0,
	},
	textOverlay: {
		position: "absolute",
		maxWidth: SCREEN_WIDTH - 48,
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
