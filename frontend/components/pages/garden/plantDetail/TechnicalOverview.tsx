import { StyleSheet, View } from "react-native";
import React from "react";
import { Styling } from "../../../../constants/Styling";
import StyledText from "../../../style/StyledText";
import Spacer from "../../../style/Spacer";

function moistureLabel(pct: number): string {
  if (pct < 20) return "Droog";
  if (pct < 50) return "Licht vochtig";
  if (pct < 80) return "Vochtig";
  return "Nat";
}

function lightLabel(pct: number): string {
  if (pct < 20) return "Donker";
  if (pct < 50) return "Gedimd";
  if (pct < 80) return "Helder";
  return "Fel";
}

interface TechnicalOverviewProps {
  probeName: string;
  battery: number;
  lastMeasurement: string;
  soilMoisture: number;
  lightLevel: number;
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

const TechnicalOverview = ({ probeName, battery, lastMeasurement, soilMoisture, lightLevel, lastTemp }: TechnicalOverviewProps) => (
  <View style={styles.container}>
    <StyledText type="head3" style={styles.title}>
      Sonde informatie
    </StyledText>
    <Spacer space={Styling.Spacing.sml} />
    <InfoRow label="Sonde naam" value={probeName} />
    <InfoRow label="Batterij" value={`${battery}%`} />
    <InfoRow label="Laatste meting" value={lastMeasurement} />
    <InfoRow label="Vocht" value={moistureLabel(soilMoisture)} />
    <InfoRow label="Licht" value={lightLabel(lightLevel)} />
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
