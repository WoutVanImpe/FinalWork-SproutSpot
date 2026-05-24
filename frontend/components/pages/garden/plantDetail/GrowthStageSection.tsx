import { StyleSheet, View } from "react-native";
import React from "react";
import { Styling } from "../../../../constants/Styling";
import StyledText from "../../../style/StyledText";
import Spacer from "../../../style/Spacer";

const BAR_TRACK_H = 8;
const BAR_FILL_MIN_H = 6;

interface Stage {
  label: string;
  dayStart: number;
  dayEnd: number;
}

interface GrowthStageSectionProps {
  stages: Stage[];
  currentStageIndex: number;
  currentDay: number;
  totalDays: number;
  stageDescription: string;
}

const GrowthStageSection = ({ stages, currentStageIndex, currentDay, totalDays, stageDescription }: GrowthStageSectionProps) => {
  const currentStage = stages[currentStageIndex];

  return (
    <View style={styles.container}>
      <StyledText type="head3" style={styles.title}>
        Groeistadia: {currentStage?.label}
      </StyledText>
      <Spacer space={Styling.Spacing.reg} />
      <View style={styles.barRow}>
        <View style={styles.barTrack}>
          {currentStageIndex > 0 && (
            <View
              style={[
                styles.barSegment,
                styles.barLeftRound,
                {
                  left: 1,
                  width: `${(stages[currentStageIndex].dayStart / totalDays) * 100}%`,
                  opacity: 0.5,
                },
              ]}
            />
          )}
          <View
            style={[
              styles.barSegment,
              styles.barRightRound,
              {
                left: `${(stages[currentStageIndex].dayStart / totalDays) * 100}%`,
                width: `${((stages[currentStageIndex].dayEnd - stages[currentStageIndex].dayStart) / totalDays) * 100}%`,
              },
            ]}
          />
          {stages.slice(currentStageIndex + 1).map((stage) => (
            <View
              key={stage.label}
              style={[
                styles.barSegment,
                styles.barRightRound,
                {
                  left: `${(stage.dayStart / totalDays) * 100}%`,
                  width: `${((stage.dayEnd - stage.dayStart) / totalDays) * 100}%`,
                  backgroundColor: "#e8e8e8",
                },
              ]}
            />
          ))}
          {stages.slice(1).map((stage) => (
            <View
              key={`m-${stage.label}`}
              style={[styles.stageMarker, { left: `${(stage.dayStart / totalDays) * 100}%` }]}
            />
          ))}
        </View>
        <StyledText type="paragh" style={styles.dayLabel}>
          Dag {currentDay}/{totalDays}
        </StyledText>
      </View>
      <Spacer space={Styling.Spacing.reg} />
      <StyledText type="paragh" style={styles.description}>
        {stageDescription}
      </StyledText>
    </View>
  );
};

export default GrowthStageSection;

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  title: {
    color: Styling.Colors.white,
  },
  barRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Styling.Spacing.reg,
  },
  barTrack: {
    flex: 1,
    height: BAR_TRACK_H,
    position: "relative",
    backgroundColor: "#e8e8e8",
    borderRadius: BAR_TRACK_H / 2,
    overflow: "visible",
  },
  barSegment: {
    position: "absolute",
    left: 0,
    top: (BAR_TRACK_H - BAR_FILL_MIN_H) / 2,
    height: BAR_FILL_MIN_H,
    backgroundColor: Styling.Colors.green,
  },
  barLeftRound: {
    borderTopLeftRadius: BAR_FILL_MIN_H / 2,
    borderBottomLeftRadius: BAR_FILL_MIN_H / 2,
  },
  barRightRound: {
    borderTopRightRadius: BAR_FILL_MIN_H / 2,
    borderBottomRightRadius: BAR_FILL_MIN_H / 2,
  },
  stageMarker: {
    position: "absolute",
    top: -2,
    bottom: -2,
    width: 2,
    backgroundColor: Styling.Colors.darkGrey,
    zIndex: 2,
    borderRadius: 1,
  },
  dayLabel: {
    color: Styling.Colors.white,
    width: 80,
    textAlign: "right",
    lineHeight: 14,
  },
  description: {
    color: Styling.Colors.white,
    lineHeight: 22,
    fontFamily: Styling.Fonts.Family.reg,
  },
});
