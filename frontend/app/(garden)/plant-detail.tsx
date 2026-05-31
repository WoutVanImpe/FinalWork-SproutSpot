import { StyleSheet, TouchableOpacity, View } from "react-native";
import React, { useState, useCallback } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
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
import { getReadings } from "../../services/garden";
import type { ReadingRecord } from "../../services/garden";

const FALLBACK_STAGES: Record<string, { label: string; dayStart: number; dayEnd: number }[]> = {
  Tomaat: [
    { label: "Zaaien", dayStart: 0, dayEnd: 7 },
    { label: "Kiem", dayStart: 7, dayEnd: 21 },
    { label: "Blad", dayStart: 21, dayEnd: 42 },
    { label: "Groeispurt", dayStart: 42, dayEnd: 63 },
    { label: "Bloei", dayStart: 63, dayEnd: 77 },
    { label: "Oogst", dayStart: 77, dayEnd: 90 },
  ],
  Kool: [
    { label: "Zaaien", dayStart: 0, dayEnd: 10 },
    { label: "Kiem", dayStart: 10, dayEnd: 25 },
    { label: "Blad", dayStart: 25, dayEnd: 50 },
    { label: "Groeispurt", dayStart: 50, dayEnd: 70 },
    { label: "Oogst", dayStart: 70, dayEnd: 85 },
  ],
};

const PLANT_DESCRIPTIONS: Record<string, string[]> = {
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

const GENERIC_STAGE_DESCRIPTIONS: Record<string, string> = {
  "Zaaien": "Zaai de zaden in vochtige potgrond. Houd de grond constant vochtig maar niet te nat.",
  "Kiem": "De zaden ontkiemen. Zorg voor voldoende licht en blijf de grond licht vochtig houden.",
  "Blad": "De plant ontwikkelt bladeren. Verhoog de watergift en zorg voor voldoende voedingsstoffen.",
  "Groeispurt": "De plant groeit snel. Geef regelmatig water en begin met wekelijkse bemesting.",
  "Bloei": "Bloemknoppen verschijnen. Zorg voor goede luchtcirculatie en blijf regelmatig water geven.",
  "Oogst": "De plant is klaar om geoogst te worden. Pluk of snijd regelmatig om nieuwe groei te stimuleren.",
};

function daysSince(dateStr: string): number {
  if (!dateStr) return 1;
  const created = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - created.getTime();
  return Math.max(1, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "Onbekend";
  const d = new Date(dateStr);
  return d.toLocaleDateString("nl-BE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false });
}

function buildStages(stageDefs: { label: string; durationDays: number }[] | undefined, plantType: string) {
  if (!stageDefs || stageDefs.length === 0) {
    return FALLBACK_STAGES[plantType] ?? FALLBACK_STAGES["Tomaat"];
  }
  let cursor = 0;
  return stageDefs.map((s) => {
    const stage = { label: s.label, dayStart: cursor, dayEnd: cursor + s.durationDays };
    cursor += s.durationDays;
    return stage;
  });
}

function getStageDescription(stageLabel: string, plantType: string, stageIndex: number): string {
  const plantDesc = PLANT_DESCRIPTIONS[plantType];
  if (plantDesc && plantDesc[stageIndex]) return plantDesc[stageIndex];
  return GENERIC_STAGE_DESCRIPTIONS[stageLabel] ?? "Volg de algemene verzorgingsinstructies voor deze plant.";
}

function waterDescription(waterLabel: string): string {
  if (waterLabel === "Weinig water") return "Laat de grond drogen tussen gietbeurten. Geef pas opnieuw water als de grond droog aanvoelt.";
  if (waterLabel === "Regelmatig") return "Houd de grond licht vochtig. Geef om de dag water, of dagelijks bij warm weer.";
  if (waterLabel === "Veel water") return "Houd de grond altijd vochtig. Geef dagelijks water en laat de grond niet uitdrogen.";
  return "Geef regelmatig water. Pas aan op basis van het seizoen.";
}

function lightDescription(lightLabel: string): string {
  if (lightLabel === "Volle zon") return "Zet op een zonnige plek met minstens 6 uur direct zonlicht per dag.";
  if (lightLabel === "Halfschaduw") return "Zet op een plek met halfschaduw. Vermijd de felle middagzon.";
  if (lightLabel === "Schaduw") return "Zet op een schaduwrijke plek. Vermijd direct zonlicht om verbranding te voorkomen.";
  return "Zet op een lichte plek, vermijd extreme schaduw of felle zon.";
}

function tempDescription(tempLabel: string): string {
  return tempLabel ? `Optimale temperatuur: ${tempLabel}. Vermijd extreme temperatuurschommelingen.` : "Gedijt bij normale kamertemperatuur. Bescherm tegen vorst.";
}

const PlantDetail = () => {
  const { plantData } = useLocalSearchParams<{ plantData: string }>();
  const plant: GardenPlant | null = plantData ? JSON.parse(plantData) : null;
  const [graphVisible, setGraphVisible] = useState(false);
  const [readings, setReadings] = useState<ReadingRecord[]>([]);
  const [hours, setHours] = useState(24);

  useFocusEffect(useCallback(() => {
    if (plant && graphVisible) {
      const plantId = parseInt(plant.id.replace("up_", ""), 10);
      if (!isNaN(plantId)) {
        getReadings(plantId, hours)
          .then((res) => { if (res.data) setReadings(res.data); })
          .catch(console.error);
      }
    }
  }, [graphVisible, plant, hours]));

  if (!plant) return null;

  const stages = buildStages(plant.stages, plant.type);
  const currentStageIndex = Math.max(0, Math.min((plant.stage.current || 1) - 1, stages.length - 1));
  const totalDays = plant.totalDays || stages[stages.length - 1]?.dayEnd || 1;
  const currentDay = daysSince(plant.created_at);

  const requirements = [
    { label: "Water", description: waterDescription(plant.water.label), level: plant.water.level, optimalMin: plant.water.optimalMin, optimalMax: plant.water.optimalMax },
    { label: "Licht", description: lightDescription(plant.light.label), level: plant.light.level, optimalMin: plant.light.optimalMin, optimalMax: plant.light.optimalMax },
    { label: "Warmte", description: tempDescription(plant.temperature.label), level: plant.temperature.level, optimalMin: plant.temperature.optimalMin, optimalMax: plant.temperature.optimalMax },
  ];

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
          stageDescription={getStageDescription(stages[currentStageIndex]?.label ?? "", plant.type, currentStageIndex)}
        />

        <Spacer space={Styling.Spacing.xlg} />

        {plant.hasTelemetry ? (
          <RequirementsSection plantName={plant.nickname} requirements={requirements} />
        ) : (
          <StyledText type="paragh" style={styles.noDataText}>
            Nog geen meetgegevens beschikbaar.
          </StyledText>
        )}

        <Spacer space={Styling.Spacing.xlg} />

        <TechnicalOverview
          probeName={plant.probeName || `Sonde ${plant.nickname}`}
          battery={plant.battery}
          lastMeasurement={formatDate(plant.last_seen)}
          soilMoisture={plant.water.level}
          lightLevel={plant.light.level}
          lastTemp={Math.floor(plant.last_temp)}
        />

        <Spacer space={Styling.Spacing.lrg} />
        <TouchableOpacity style={styles.graphBtn} onPress={() => setGraphVisible(true)}>
          <StyledText type="head4" style={styles.graphBtnText}>
            Bekijk grafieken
          </StyledText>
        </TouchableOpacity>
        <Spacer space={175} />
      </StyledView>
      <GraphModal
        visible={graphVisible}
        onDismiss={() => setGraphVisible(false)}
        readings={readings}
        optimalRanges={{
          water: { optimalMin: plant.water.optimalMin, optimalMax: plant.water.optimalMax },
          light: { optimalMin: plant.light.optimalMin, optimalMax: plant.light.optimalMax },
          temperature: { optimalMin: plant.temperature.optimalMin, optimalMax: plant.temperature.optimalMax },
        }}
        selectedHours={hours}
        onTimeRangeChange={setHours}
      />
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
  noDataText: {
    color: Styling.Colors.white,
    textAlign: "center",
  },
});
