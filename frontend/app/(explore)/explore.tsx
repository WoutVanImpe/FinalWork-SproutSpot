import { StyleSheet, ActivityIndicator, FlatList, View, TextInput, Keyboard } from "react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ExploreHeader from "../../components/pages/explore/header/ExploreHeader";
import MonthlyCandidates from "../../components/pages/explore/carousel/MonthlyCandidates";
import StyledText from "../../components/style/StyledText";
import StyledIcon from "../../components/style/StyledIcon";
import VegetableCard from "../../components/shared/vegetableCard/VegetableCard";
import SearchIcon from "../../assets/icons/search.svg";
import Spacer from "../../components/style/Spacer";
import { Styling } from "../../constants/Styling";
import { BAR_MARGIN } from "../../constants/tabConfig";
import { getAllPlants } from "../../services/plants";
import type { PlantListItem } from "../../services/plants";
import type { VegetableInfo } from "../../data/vegetables";

const CARD_GAP = Styling.Spacing.reg;

const Explore = () => {
	const [plants, setPlants] = useState<PlantListItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const inputRef = useRef<TextInput>(null);
	const insets = useSafeAreaInsets();

	useEffect(() => {
		getAllPlants()
			.then((res) => { if (res.data) setPlants(res.data); })
			.catch(console.error)
			.finally(() => setLoading(false));
	}, []);

	const asCardData: VegetableInfo[] = useMemo(() => plants.map((p) => ({
		id: p.id,
		name: p.name,
		image: { uri: p.image },
		placement: p.placement,
		sunlight: p.sunlight,
		sowingPeriod: p.sowingPeriod,
		careLevel: p.careLevel,
	})), [plants]);

	const filteredData = useMemo(() => {
		if (!searchQuery.trim()) return asCardData;
		const q = searchQuery.toLowerCase();
		return asCardData.filter((item) => item.name.toLowerCase().includes(q));
	}, [asCardData, searchQuery]);

	const handleItemPress = (id: string) => {
		router.push(`/(explore)/vegetable-info?id=${id}`);
	};

	if (loading) {
		return (
			<View style={styles.page}>
				<ActivityIndicator color={Styling.Colors.green} style={{ marginTop: 40 }} />
			</View>
		);
	}

	return (
		<View style={styles.page}>
			<FlatList
				data={filteredData}
				numColumns={3}
				keyExtractor={(item) => item.id}
				contentContainerStyle={{ paddingTop: insets.top + 60, paddingBottom: 175, paddingHorizontal: BAR_MARGIN }}
				columnWrapperStyle={styles.row}
				keyboardShouldPersistTaps="handled"
				showsVerticalScrollIndicator={false}
				onScrollBeginDrag={() => inputRef.current?.blur()}
				ListHeaderComponent={
					<>
						<View style={{ marginHorizontal: -BAR_MARGIN }}>
							<ExploreHeader onButtonPress={() => router.push("/(explore)/plant-finder")} />
						</View>
						<Spacer space={Styling.Spacing.xsm} />
						<MonthlyCandidates data={asCardData} onItemPress={handleItemPress} />
						<Spacer space={Styling.Spacing.reg} />
						<StyledText type="head2" style={styles.title}>Alle groenten</StyledText>
						<Spacer space={Styling.Spacing.med} />
						<View style={styles.searchBar}>
							<StyledIcon Icon={SearchIcon} size="reg" fill={Styling.Colors.white} />
							<TextInput
								ref={inputRef}
								style={styles.input}
								placeholder="Zoeken..."
								placeholderTextColor={Styling.Colors.white}
								value={searchQuery}
								onChangeText={setSearchQuery}
							/>
						</View>
						<Spacer space={Styling.Spacing.reg} />
						{searchQuery.trim() && filteredData.length === 0 && (
							<StyledText type="paragh" style={styles.emptyText}>
								Geen groenten gevonden voor "{searchQuery}"
							</StyledText>
						)}
					</>
				}
				ListFooterComponent={
					!searchQuery.trim() && filteredData.length > 0 ? (
						<StyledText type="paragh" style={styles.countText}>
							{filteredData.length} groenten
						</StyledText>
					) : null
				}
				renderItem={({ item }) => (
					<View style={styles.cardWrapper}>
						<VegetableCard vegetable={{ ...item, onPress: () => handleItemPress(item.id) }} />
					</View>
				)}
			/>
		</View>
	);
};

export default Explore;

const styles = StyleSheet.create({
	page: {
		flex: 1,
		backgroundColor: Styling.Colors.gradGrey,
	},
	row: {
		gap: CARD_GAP,
		marginBottom: CARD_GAP,
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
	cardWrapper: {
		flex: 1,
	},
	emptyText: {
		color: Styling.Colors.white,
		textAlign: "center",
	},
	countText: {
		color: Styling.Colors.white,
		textAlign: "center",
		marginTop: Styling.Spacing.reg,
		opacity: 0.6,
	},
});
