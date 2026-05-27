import { StyleSheet, View } from "react-native";
import React from "react";
import { Styling } from "../../../../constants/Styling";
import StyledText from "../../../style/StyledText";
import Spacer from "../../../style/Spacer";

interface TechnicalOverviewProps {
  probeName: string;
  battery: number;
  lastMeasurement: string;
  moistureStatus: string;
  lightStatus: string;
  lastTemp: number;
}

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.infoRow}>
    <StyledText type="paragh" style={styles.infoLabel}>
      {label}
    </StyledText>
    <StyledText type="paragh" style={styles.infoValue}>
      {value}
    </StyledText>
  </View>
);

const TechnicalOverview = ({ probeName, battery, lastMeasurement, moistureStatus, lightStatus, lastTemp }: TechnicalOverviewProps) => (
  <View style={styles.container}>
    <StyledText type="head3" style={styles.title}>
      Sonde informatie
    </StyledText>
    <Spacer space={Styling.Spacing.sml} />
    <InfoRow label="Sonde naam" value={probeName} />
    <InfoRow label="Batterij" value={`${battery}%`} />
    <InfoRow label="Laatste meting" value={lastMeasurement} />
    <InfoRow label="Vocht" value={moistureStatus} />
    <InfoRow label="Licht" value={lightStatus} />
    <InfoRow label="Temperatuur" value={`${lastTemp}°C`} />
  </View>
);

export default TechnicalOverview;

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  title: {
    color: Styling.Colors.white,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Styling.Padding.sml,
    borderBottomWidth: 1,
    borderBottomColor: Styling.Colors.lightGrey,
  },
  infoLabel: {
    color: Styling.Colors.white,
    flex: 1,
  },
  infoValue: {
    color: Styling.Colors.white,
    fontFamily: Styling.Fonts.Family.reg,
  },
});
