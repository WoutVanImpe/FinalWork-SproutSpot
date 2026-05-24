import { Dimensions, FlatList, StyleSheet, View } from "react-native";
import React from "react";
import StyledText from "../../../style/StyledText";
import VegetableCard from "../../../shared/vegetableCard/VegetableCard";
import { Styling } from "../../../../constants/Styling";
import { BAR_MARGIN } from "../../../../constants/tabConfig";
import Spacer from "../../../style/Spacer";
import type { VegetableInfo } from "../../../../data/vegetables";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_GAP = Styling.Spacing.lrg;
const CARD_WIDTH = (SCREEN_WIDTH - BAR_MARGIN - 1.1 * CARD_GAP) / 3.5;

const MONTHS = [
    "januari", "februari", "maart", "april", "mei", "juni",
    "juli", "augustus", "september", "oktober", "november", "december",
];

interface MonthlyCandidatesProps {
    data: VegetableInfo[];
    onItemPress?: (id: string) => void;
}

const MonthlyCandidates = ({ data, onItemPress }: MonthlyCandidatesProps) => {
    const currentMonth = new Date().getMonth() + 1;

    const candidates = data
        .filter((p) => p.sowingPeriod.startMonth <= currentMonth && p.sowingPeriod.endMonth >= currentMonth);

    const title = `Kanshebbers voor ${MONTHS[currentMonth - 1]}`;

    if (candidates.length === 0) return null;

    return (
        <View style={styles.container}>
            <StyledText type="head2">{title}</StyledText>
            <Spacer space={Styling.Spacing.sml} />
            <View style={styles.scrollOuter}>
                <FlatList
                    horizontal
                    data={candidates}
                    keyExtractor={(item) => item.id}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                    renderItem={({ item }) => (
                        <View style={styles.cardWrapper}>
                            <VegetableCard vegetable={onItemPress ? { ...item, onPress: () => onItemPress(item.id) } : item} />
                        </View>
                    )}
                />
            </View>
        </View>
    );
};

export default MonthlyCandidates;

const styles = StyleSheet.create({
    container: {
        width: "100%",
    },
    scrollOuter: {
        marginHorizontal: -BAR_MARGIN,
    },
    scrollContent: {
        paddingHorizontal: BAR_MARGIN,
        gap: CARD_GAP,
    },
    cardWrapper: {
        width: CARD_WIDTH,
    },
});
