import { StyleSheet, TextInput, TouchableOpacity, View, ActivityIndicator } from "react-native";
import React, { useCallback, useRef, useState } from "react";
import { useLocalSearchParams, router, useFocusEffect } from "expo-router";
import * as Clipboard from "expo-clipboard";
import { Styling } from "../../constants/Styling";
import StyledText from "../../components/style/StyledText";
import Spacer from "../../components/style/Spacer";
import { useAuth } from "../../context/AuthContext";
import { renameProbeByCode } from "../../services/probes";
import FlowLayout from "../../components/pages/explore/plantFlow/FlowLayout";

const PlantStep5 = () => {
  const { vegId, name } = useLocalSearchParams<{ vegId: string; name: string }>();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [probeName, setProbeName] = useState("");
  const [probeId, setProbeId] = useState<number | null>(null);
  const [renaming, setRenaming] = useState(false);
  const [renameError, setRenameError] = useState("");
  const [copied, setCopied] = useState(false);

  const pairingCodeRef = useRef(user?.pairing_code ?? "TE123456");
  const displayName = decodeURIComponent(name || "mijn plant");

  useFocusEffect(useCallback(() => { setStep(0); setProbeName(""); setProbeId(null); setRenameError(""); }, []));

  const handleCopyCode = async () => {
    await Clipboard.setStringAsync(pairingCodeRef.current);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRename = async () => {
    if (!probeName.trim()) return;
    setRenaming(true);
    setRenameError("");
    try {
      const res = await renameProbeByCode(pairingCodeRef.current, probeName.trim());
      if (res.data?.id) {
        setProbeId(res.data.id);
        setStep(4);
      }
    } catch {
      setRenameError("Nog geen sonde gevonden. Heb je de koppelcode al ingevuld op sproutspot.local?");
    } finally {
      setRenaming(false);
    }
  };

  const navigateToGarden = () => {
    const params = `placementMode=true&vegId=${vegId}&name=${encodeURIComponent(displayName)}${probeId ? `&probeId=${probeId}` : ""}`;
    router.push(`/(garden)/garden?${params}`);
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <View style={styles.content}>
            <StyledText type="head3" style={styles.stepTitle}>Stap 1: Sonde opladen</StyledText>
            <Spacer space={Styling.Spacing.sml} />
            <StyledText type="paragh" style={styles.stepDesc}>
              Sluit je sonde via USB aan op de oplader. Zodra hij stroom krijgt, kun je hem straks instellen.
            </StyledText>
            <Spacer space={Styling.Spacing.xlg} />
            <TouchableOpacity style={styles.nextBtn} onPress={() => setStep(1)} activeOpacity={0.7}>
              <StyledText type="head4" style={{ color: Styling.Colors.white }}>Volgende</StyledText>
            </TouchableOpacity>
          </View>
        );

      case 1:
        return (
          <View style={styles.content}>
            <StyledText type="head3" style={styles.stepTitle}>Stap 2: Verbinden met je sonde</StyledText>
            <Spacer space={Styling.Spacing.sml} />
            <View style={styles.guideStep}>
              <StyledText type="paragh" style={styles.guideNum}>1.</StyledText>
              <StyledText type="paragh" style={styles.guideText}>Zoek je WiFi-naam en wachtwoord op. Je hebt ze zo dadelijk nodig.</StyledText>
            </View>
            <View style={styles.guideStep}>
              <StyledText type="paragh" style={styles.guideNum}>2.</StyledText>
              <StyledText type="paragh" style={styles.guideText}>Ga naar je WiFi-instellingen en verbind met het netwerk <StyledText type="paragh" style={{ color: Styling.Colors.green }}>SproutSpot-Setup</StyledText>.</StyledText>
            </View>
            <View style={styles.guideStep}>
              <StyledText type="paragh" style={styles.guideNum}>3.</StyledText>
              <StyledText type="paragh" style={styles.guideText}>Open je browser en ga naar <StyledText type="paragh" style={{ color: Styling.Colors.green }}>sproutspot.local</StyledText>.</StyledText>
            </View>
            <View style={styles.guideStep}>
              <StyledText type="paragh" style={styles.guideNum}>4.</StyledText>
              <StyledText type="paragh" style={styles.guideText}>Vul daar je WiFi-naam, wachtwoord en onderstaande koppelcode in.</StyledText>
            </View>
            <Spacer space={Styling.Spacing.reg} />
            <TouchableOpacity style={styles.codeBox} onPress={handleCopyCode} activeOpacity={0.7}>
              <StyledText type="smParagh" style={styles.codeLabel}>
                {copied ? "Gekopieerd!" : "Klik hier om je koppelcode te kopiëren"}
              </StyledText>
              <StyledText type="head3" style={styles.codeValue}>{pairingCodeRef.current}</StyledText>
            </TouchableOpacity>
            <Spacer space={Styling.Spacing.reg} />
            <TouchableOpacity style={styles.nextBtn} onPress={() => setStep(2)} activeOpacity={0.7}>
              <StyledText type="head4" style={{ color: Styling.Colors.white }}>Volgende</StyledText>
            </TouchableOpacity>
          </View>
        );

      case 2:
        return (
          <View style={styles.content}>
            <StyledText type="head3" style={styles.stepTitle}>Stap 3: Terug naar je eigen WiFi</StyledText>
            <Spacer space={Styling.Spacing.sml} />
            <StyledText type="paragh" style={styles.stepDesc}>
              Ga terug naar je WiFi-instellingen en verbind weer met je thuisnetwerk. De sonde is nu ingesteld en zal vanzelf verbinding maken.
            </StyledText>
            <Spacer space={Styling.Spacing.xlg} />
            <TouchableOpacity style={styles.nextBtn} onPress={() => setStep(3)} activeOpacity={0.7}>
              <StyledText type="head4" style={{ color: Styling.Colors.white }}>Volgende</StyledText>
            </TouchableOpacity>
          </View>
        );

      case 3:
        return (
          <View style={styles.content}>
            <StyledText type="head3" style={styles.stepTitle}>Stap 4: Geef je sonde een naam</StyledText>
            <Spacer space={Styling.Spacing.sml} />
            <StyledText type="paragh" style={styles.stepDesc}>
              Kies een herkenbare naam voor je sonde, zoals "{displayName} - sonde".
            </StyledText>
            <Spacer space={Styling.Spacing.reg} />
            <TextInput
              style={styles.input}
              value={probeName}
              onChangeText={setProbeName}
              placeholder="Naam van je sonde"
              placeholderTextColor={Styling.Colors.lightGrey}
              maxLength={30}
            />
            {renameError ? (
              <>
                <Spacer space={Styling.Spacing.sml} />
                <StyledText type="smParagh" style={styles.errorText}>{renameError}</StyledText>
              </>
            ) : null}
            <Spacer space={Styling.Spacing.reg} />
            <TouchableOpacity
              style={[styles.nextBtn, (!probeName.trim() || renaming) && styles.disabledBtn]}
              onPress={handleRename}
              activeOpacity={0.7}
              disabled={!probeName.trim() || renaming}
            >
              {renaming ? (
                <ActivityIndicator color={Styling.Colors.white} size="small" />
              ) : (
                <StyledText type="head4" style={{ color: Styling.Colors.white }}>Geef naam</StyledText>
              )}
            </TouchableOpacity>
          </View>
        );

      case 4:
        return (
          <View style={styles.content}>
            <StyledText type="head3" style={styles.stepTitle}>Stap 5: Sonde planten</StyledText>
            <Spacer space={Styling.Spacing.sml} />
            <View style={styles.guideStep}>
              <StyledText type="paragh" style={styles.guideNum}>1.</StyledText>
              <StyledText type="paragh" style={styles.guideText}>Zorg dat de sonde volledig is opgeladen.</StyledText>
            </View>
            <View style={styles.guideStep}>
              <StyledText type="paragh" style={styles.guideNum}>2.</StyledText>
              <StyledText type="paragh" style={styles.guideText}>Plaats de sonde 5 cm naast de zaaiplek. Zorg dat de sonde 4 cm diep steekt.</StyledText>
            </View>
            <Spacer space={Styling.Spacing.xlg} />
            <TouchableOpacity style={styles.finalBtn} onPress={navigateToGarden} activeOpacity={0.7}>
              <StyledText type="head4" style={{ color: Styling.Colors.white }}>Naar de tuin!</StyledText>
            </TouchableOpacity>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <FlowLayout
      title="Sonde instellen"
      onBack={() => step > 0 ? setStep(step - 1) : router.push(`/(explore)/plant-step4?vegId=${vegId}&name=${encodeURIComponent(displayName)}`)}
    >
      {renderStep()}
    </FlowLayout>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Styling.Padding.reg,
    alignItems: "center",
  },
  stepTitle: {
    color: Styling.Colors.white,
    alignSelf: "flex-start",
  },
  stepDesc: {
    color: Styling.Colors.white,
    lineHeight: 22,
  },
  guideStep: {
    flexDirection: "row",
    gap: Styling.Spacing.sml,
    paddingVertical: Styling.Padding.sml,
    alignItems: "flex-start",
  },
  guideNum: {
    color: Styling.Colors.green,
    width: 20,
  },
  guideText: {
    color: Styling.Colors.white,
    flex: 1,
    lineHeight: 22,
  },
  codeBox: {
    width: "100%",
    alignItems: "center",
    paddingVertical: Styling.Padding.reg,
    borderWidth: 1,
    borderColor: Styling.Colors.green,
    borderRadius: Styling.BorderRadius.reg,
    backgroundColor: Styling.Colors.darkGrey,
  },
  codeLabel: {
    color: Styling.Colors.lightGrey,
    marginBottom: Styling.Spacing.xsm,
  },
  codeValue: {
    color: Styling.Colors.green,
    letterSpacing: 2,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: Styling.Colors.white,
    borderRadius: Styling.BorderRadius.reg,
    paddingHorizontal: Styling.Padding.reg,
    paddingVertical: Styling.Padding.sml,
    color: Styling.Colors.white,
    fontFamily: Styling.Fonts.Family.bold,
    fontSize: Styling.Fonts.Size.reg,
  },
  nextBtn: {
    backgroundColor: Styling.Colors.green,
    borderRadius: Styling.BorderRadius.reg,
    paddingHorizontal: Styling.Padding.lrg,
    paddingVertical: Styling.Padding.sml,
  },
  finalBtn: {
    backgroundColor: Styling.Colors.green,
    borderRadius: Styling.BorderRadius.reg,
    paddingHorizontal: Styling.Padding.lrg,
    paddingVertical: Styling.Padding.sml,
  },
  disabledBtn: {
    opacity: 0.4,
  },
  errorText: {
    color: Styling.Colors.red,
    textAlign: "center",
  },
});

export default PlantStep5;
