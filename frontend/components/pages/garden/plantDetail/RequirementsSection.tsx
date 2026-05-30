import { StyleSheet, View, ViewStyle } from "react-native";
import React from "react";
import { Styling } from "../../../../constants/Styling";
import StyledText from "../../../style/StyledText";
import Spacer from "../../../style/Spacer";

const BAR_TRACK_H = 14;
const BAR_FILL_MIN_H = 10;

const StatusBar = ({ level, optimalMin, optimalMax }: { level: number; optimalMin: number; optimalMax: number }) => {
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${level}%` }]} />
      <View style={[styles.optimalMark, { left: `${optimalMin}%` }]} />
      <View style={[styles.optimalMark, { left: `${optimalMax}%` }]} />
    </View>
  );
};

interface RequirementData {
  label: string;
  description?: string;
  level: number;
  optimalMin: number;
  optimalMax: number;
}

interface RequirementsSectionProps {
  plantName: string;
  requirements: RequirementData[];
}

const Row = ({ label, children, style }: { label: string; children?: React.ReactNode; style?: ViewStyle }) => (
  <View style={[styles.row, style]}>
    <StyledText type="paragh" style={styles.rowLabel}>
      {label}
    </StyledText>
    {children}
  </View>
);

const RequirementsSection = ({ plantName, requirements }: RequirementsSectionProps) => (
  <View style={styles.container}>
    <StyledText type="head3" style={styles.title}>
      Wat heeft {plantName} nodig?
    </StyledText>
    <Spacer space={Styling.Spacing.reg} />
    {requirements.map((req, i) => (
      <View key={i}>
        <Row label={req.label}>
          <StatusBar level={req.level} optimalMin={req.optimalMin} optimalMax={req.optimalMax} />
        </Row>
        {req.description && (
          <StyledText type="smParagh" style={styles.description}>
            {req.description}
          </StyledText>
        )}
        {i < requirements.length - 1 && <Spacer space={Styling.Spacing.sml} />}
      </View>
    ))}
  </View>
);

export default RequirementsSection;

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  title: {
    color: Styling.Colors.white,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Styling.Spacing.reg,
  },
  rowLabel: {
    color: Styling.Colors.white,
    width: "50%",
    flexShrink: 0,
  },
  description: {
    color: Styling.Colors.lightGrey,
    fontStyle: "italic",
    marginTop: 4,
    lineHeight: 18,
  },
  track: {
    flex: 1,
    height: BAR_TRACK_H,
    backgroundColor: "#e8e8e8",
    borderRadius: BAR_TRACK_H / 2,
    position: "relative",
    overflow: "visible",
  },
  fill: {
    position: "absolute",
    left: 1,
    top: (BAR_TRACK_H - BAR_FILL_MIN_H) / 2,
    height: BAR_FILL_MIN_H,
    backgroundColor: Styling.Colors.green,
    borderRadius: BAR_FILL_MIN_H / 2,
  },
  optimalMark: {
    position: "absolute",
    top: -2,
    bottom: -2,
    width: 2,
    backgroundColor: Styling.Colors.darkGrey,
    borderRadius: 1,
  },
});
