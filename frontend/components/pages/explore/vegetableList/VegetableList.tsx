import { Keyboard, LayoutChangeEvent, StyleSheet, TextInput, View } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import StyledText from "../../../style/StyledText";
import StyledIcon from "../../../style/StyledIcon";
import { VegetableCardProps } from "../../../shared/vegetableCard/VegetableCard";
import CardContainer from "../../../shared/vegetableCard/CardContainer";
import SearchIcon from "../../../../assets/icons/search.svg";
import { Styling } from "../../../../constants/Styling";
import Spacer from "../../../style/Spacer";
import { useScroll } from "../../../../context/ScrollContext";

interface VegetableListProps {
	data: VegetableCardProps[];
	onItemPress?: (id: string) => void;
}

const VegetableList = ({ data, onItemPress }: VegetableListProps) => {
	const { scrollTo } = useScroll();
	const inputRef = useRef<TextInput>(null);
	const [containerY, setContainerY] = useState(0);
	const [searchBarY, setSearchBarY] = useState(0);

	useEffect(() => {
		const hide = Keyboard.addListener("keyboardDidHide", () => {
			inputRef.current?.blur();
		});
		return () => hide.remove();
	}, []);

	const handleContainerLayout = (e: LayoutChangeEvent) => {
		setContainerY(e.nativeEvent.layout.y);
	};

	const handleSearchBarLayout = (e: LayoutChangeEvent) => {
		setSearchBarY(e.nativeEvent.layout.y);
	};

	const handleFocus = () => {
		const targetY = containerY + searchBarY - 50;
		if (targetY > 0) {
			scrollTo(targetY, true);
		}
	};

	return (
		<View style={styles.container} onLayout={handleContainerLayout}>
			<StyledText type="head2" style={styles.title}>
				Alle groenten
			</StyledText>
			<Spacer space={Styling.Spacing.med} />
			<View style={styles.searchBar} onLayout={handleSearchBarLayout}>
				<StyledIcon Icon={SearchIcon} size="reg" fill={Styling.Colors.white} />
				<TextInput ref={inputRef} style={styles.input} placeholder="Zoeken..." placeholderTextColor={Styling.Colors.white} onFocus={handleFocus} />
			</View>
			<Spacer space={Styling.Spacing.reg} />
			<CardContainer data={data} onItemPress={onItemPress} style={{ marginBottom: 300 }} />
		</View>
	);
};

export default VegetableList;

const styles = StyleSheet.create({
	container: {
		width: "100%",
	},
	title: {
		alignSelf: "flex-start",
	},
	searchBar: {
		flexDirection: "row",
		alignItems: "center",
		width: "100%",
		borderWidth: 1,
		borderColor: Styling.Colors.white,
		borderRadius: Styling.BorderRadius.reg,
		paddingHorizontal: Styling.Spacing.reg,
		paddingVertical: Styling.Spacing.sml,
		gap: Styling.Spacing.sml,
	},
	input: {
		flex: 1,
		color: Styling.Colors.white,
		fontFamily: Styling.Fonts.Family.bold,
		fontSize: Styling.Fonts.Size.reg,
		padding: 0,
	},
});
