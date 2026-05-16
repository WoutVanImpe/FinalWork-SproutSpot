import { Dimensions, ScrollView, StyleSheet, View } from "react-native";
import React from "react";
import StyledText from "../../../style/StyledText";
import VegetableCard, { VegetableCardProps } from "../../../shared/vegetableCard/VegetableCard";
import { Styling } from "../../../../constants/Styling";
import { BAR_MARGIN } from "../../../../constants/tabConfig";
import Spacer from "../../../style/Spacer";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_GAP = Styling.Spacing.lrg;
const CARD_WIDTH = (SCREEN_WIDTH - BAR_MARGIN - 1.1 * CARD_GAP) / 3.5;

interface MonthlyCandidatesProps {
    data: VegetableCardProps[];
    onItemPress?: (id: string) => void;
}

const MonthlyCandidates = ({ data, onItemPress }: MonthlyCandidatesProps) => {
    return (
        <View style={styles.container}>
            <StyledText type="head2">Kanshebbers voor april</StyledText>
            <Spacer space={Styling.Spacing.sml} />
            <View style={styles.scrollOuter}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {data.map((item) => (
                        <View key={item.id} style={styles.cardWrapper}>
                            <VegetableCard vegetable={onItemPress ? { ...item, onPress: () => onItemPress(item.id) } : item} />
                        </View>
                    ))}
                </ScrollView>
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
