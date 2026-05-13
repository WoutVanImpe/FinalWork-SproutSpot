import { StyleSheet, Text, TextStyle } from "react-native";
import { Styling } from "../../constants/Styling";
import React, { ReactNode } from "react";

const TextType = {
	paragh: Styling.Fonts.Size.reg,
	smParagh: Styling.Fonts.Size.sml,
	head1: Styling.Fonts.Size.xxl,
	head2: Styling.Fonts.Size.xlg,
	head3: Styling.Fonts.Size.lrg,
    head4: Styling.Fonts.Size.med,
} as const;

type TextTypeKey = keyof typeof TextType;

const StyledText = ({ type, fullCap = false, style, children, ...props }: { type?: TextTypeKey; fullCap?: boolean; style?: TextStyle; children?: ReactNode }) => {
	return (
		<Text style={[styles.text, { fontSize: type ? TextType[type] : undefined }, { textTransform: fullCap ? "uppercase" : "none" }, style]} {...props}>
			{children}
		</Text>
	);
};

export default StyledText;

const styles = StyleSheet.create({
	text: {
		color: Styling.Colors.white,
		fontFamily: Styling.Fonts.Family.bold,
	},
});
