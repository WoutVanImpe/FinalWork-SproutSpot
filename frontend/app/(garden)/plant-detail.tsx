import { StyleSheet, TouchableOpacity, View } from "react-native";
import React, { useState } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { Styling } from "../../constants/Styling";
import StyledView from "../../components/style/StyledView";
import StyledText from "../../components/style/StyledText";
import StyledIcon from "../../components/style/StyledIcon";
import Spacer from "../../components/style/Spacer";
import BackIcon from "../../assets/icons/undo.svg";
import GrowthStageSection from "../../components/pages/garden/plantDetail/GrowthStageSection";
import RequirementsSection from "../../components/pages/garden/plantDetail/RequirementsSection";
import TechnicalOverview from "../../components/pages/garden/plantDetail/TechnicalOverview";
import GraphModal from "../../components/pages/garden/plantDetail/GraphModal";
import { GardenPlant } from "../../components/pages/garden/gardenGrid/GardenGridItem";

const TOMATO_STAGES = [
  { label: "Zaaien", dayStart: 0, dayEnd: 7 },
  { label: "Kiem", dayStart: 7, dayEnd: 21 },
  { label: "Blad", dayStart: 21, dayEnd: 42 },
  { label: "Groeispurt", dayStart: 42, dayEnd: 63 },
  { label: "Bloei", dayStart: 63, dayEnd: 77 },
  { label: "Oogst", dayStart: 77, dayEnd: 90 },
];

const CABBAGE_STAGES = [
  { label: "Zaaien", dayStart: 0, dayEnd: 10 },
  { label: "Kiem", dayStart: 10, dayEnd: 25 },
  { label: "Blad", dayStart: 25, dayEnd: 50 },
  { label: "Groeispurt", dayStart: 50, dayEnd: 70 },
  { label: "Oogst", dayStart: 70, dayEnd: 85 },
];

const STAGE_DESCRIPTIONS: Record<string, string[]> = {
  Tomaat: [
    "Zaai de tomatenzaden in vochtige potgrond op een warme plek. Houd de grond constant vochtig maar niet nat.",
    "De zaden ontkiemen. Kleine kiemblaadjes verschijnen boven de grond. Zorg voor voldoende licht om strekken te voorkomen.",
    "De plant ontwikkelt echte bladeren. Verpot naar een grotere pot en begin met het afharden van de plant.",
    "De plant maakt veel blad en stengels aan. Verhoog de watergift en begin met wekelijkse bemesting.",
    "Bloemknoppen verschijnen aan de toppen. Zorg voor goede luchtcirculatie en blijf regelmatig water geven.",
    "De tomaten zijn rijp en kunnen geoogst worden. Pluk regelmatig om nieuwe vruchtvorming te stimuleren.",
  ],
  Kool: [
    "Zaai de koolzaden in zaaitrays met lichte potgrond. Heldere plek zonder directe felle zon.",
    "De zaden ontkiemen en kleine kiemplantjes verschijnen. Verplaats naar een lichtere plek.",
    "De plant vormt stevige bladeren. Verplant naar de definitieve plek met voldoende ruimte.",
    "De kool begint een krop of stronk te vormen. Gelijkmatig water geven is nu belangrijk.",
    "De kool is volgroeid en klaar om geoogst te worden. Snijd de stronk onder de krop af.",
  ],
};

const PlantDetail = () => {
  const { plantData } = useLocalSearchParams<{ plantData: string }>();
  const plant: GardenPlant | null = plantData ? JSON.parse(plantData) : null;
  const [graphVisible, setGraphVisible] = useState(false);

  if (!plant) return null;

  const isTomato = plant.type === "Tomaat";
  const stages = isTomato ? TOMATO_STAGES : CABBAGE_STAGES;
  const descriptions = STAGE_DESCRIPTIONS[plant.type] || STAGE_DESCRIPTIONS["Tomaat"];
  const currentStageIndex = Math.min(plant.stage.current, stages.length - 1);

  const requirements = [
    { label: "Water", level: plant.water.level, optimalMin: plant.water.optimalMin, optimalMax: plant.water.optimalMax },
    { label: "Licht", level: plant.light.level, optimalMin: plant.light.optimalMin, optimalMax: plant.light.optimalMax },
    { label: "Warmte", level: plant.temperature.level, optimalMin: plant.temperature.optimalMin, optimalMax: plant.temperature.optimalMax },
  ];

  const totalDays = stages[stages.length - 1].dayEnd;
  const currentDay = stages[currentStageIndex]?.dayStart + Math.floor((stages[currentStageIndex]?.dayEnd - stages[currentStageIndex]?.dayStart) / 2) || 1;

  return (
    <>
      <StyledView>
        <View style={styles.header}>
          <View style={styles.headerBack}>
            <TouchableOpacity onPress={() => router.navigate("/(garden)/garden")}>
              <StyledIcon Icon={BackIcon} size="med" fill={Styling.Colors.white} />
            </TouchableOpacity>
          </View>
          <StyledText type="head1" style={styles.headerTitle}>
            {plant.nickname}
          </StyledText>
        </View>

        <Spacer space={Styling.Spacing.lrg} />
        <GrowthStageSection
          stages={stages}
          currentStageIndex={currentStageIndex}
          currentDay={currentDay}
          totalDays={totalDays}
          stageDescription={descriptions[currentStageIndex] || ""}
        />

        <Spacer space={Styling.Spacing.xlg} />

        <RequirementsSection plantName={plant.nickname} requirements={requirements} />

        <Spacer space={Styling.Spacing.xlg} />

        <TechnicalOverview
          probeName={plant.probeName || `Sonde ${plant.nickname}`}
          battery={plant.battery}
          lastMeasurement="12/05/2026 14:30"
          lastMoisture={plant.water.level}
          lastLight={28000}
          lastTemp={22}
        />

        <Spacer space={Styling.Spacing.lrg} />
        <TouchableOpacity style={styles.graphBtn} onPress={() => setGraphVisible(true)}>
          <StyledText type="head4" style={styles.graphBtnText}>
            Bekijk grafieken
          </StyledText>
        </TouchableOpacity>
        <Spacer space={175} />
      </StyledView>
      <GraphModal visible={graphVisible} onDismiss={() => setGraphVisible(false)} />
    </>
  );
};

export default PlantDetail;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: Styling.Colors.white,
  },
  headerBack: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    zIndex: 1,
  },
  graphBtn: {
    backgroundColor: Styling.Colors.green,
    paddingVertical: Styling.Padding.sml,
    paddingHorizontal: Styling.Padding.lrg,
    borderRadius: Styling.BorderRadius.reg,
    alignItems: "center",
    alignSelf: "center",
    width: "100%",
  },
  graphBtnText: {
    color: Styling.Colors.white,
  },
});
