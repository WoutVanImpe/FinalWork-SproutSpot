import { Image, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import React, { useState } from "react";
import { Styling } from "../../constants/Styling";
import StyledText from "../style/StyledText";
import StyledIcon from "../style/StyledIcon";
import Spacer from "../style/Spacer";
import BackIcon from "../../assets/icons/undo.svg";
import OptionButton from "../pages/explore/plantFinder/OptionButton";
import ProgressBar from "../pages/explore/plantFinder/ProgressBar";
import CardContainer from "../shared/vegetableCard/CardContainer";
import { VEGETABLES, VEGETABLE_DETAILS, VegetableInfo } from "../../data/vegetables";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Clipboard from "expo-clipboard";
import StyledView from "../style/StyledView";
import { BAR_MARGIN } from "../../constants/tabConfig";

interface RegisterFlowProps {
	onComplete: (vegId: string, name: string) => void;
}

const PAIRING_CODE = "SP12AB3456";

type Step =
	| "intro"
	| "finder"
	| "results"
	| "step1"
	| "step2"
	| "step3"
	| "step4"
	| { type: "step5"; sub: number }
	| "done";

const QUESTIONS = [
	{
		title: "Waar ga je planten?",
		explanation: "Heb je een tuin of balkon? Of ga je binnen aan de slag? Binnenplanten hebben minder licht nodig, buitenplanten krijgen meer ruimte.",
		options: [
			{ label: "Binnen", value: "inside" },
			{ label: "Buiten", value: "outside" },
			{ label: "Maakt niet uit", value: "either" },
		],
	},
	{
		title: "Hoeveel zon krijgt de plek?",
		explanation: "Kijk naar de plek waar je wilt planten. Krijgt het direct zonlicht, staat het in de halfschaduw, of is het er vooral schaduwrijk?",
		options: [
			{ label: "Volle zon (+6 uur)", value: "full" },
			{ label: "Halfschaduw (3-6 uur)", value: "partial" },
			{ label: "Schaduw (-3 uur)", value: "shade" },
		],
	},
	{
		title: "Wanneer wil je planten?",
		explanation: "Niet elke plant kan het hele jaar door gezaaid worden. Kies de maand waarin je ongeveer wilt beginnen.",
		options: [
			{ label: "Januari", value: "1" }, { label: "Februari", value: "2" },
			{ label: "Maart", value: "3" }, { label: "April", value: "4" },
			{ label: "Mei", value: "5" }, { label: "Juni", value: "6" },
			{ label: "Juli", value: "7" }, { label: "Augustus", value: "8" },
			{ label: "September", value: "9" }, { label: "Oktober", value: "10" },
			{ label: "November", value: "11" }, { label: "December", value: "12" },
		],
	},
	{
		title: "Hoeveel tijd heb je?",
		explanation: "Sommige planten hebben elke dag aandacht nodig, andere kunnen een weekje zonder. Bedenk wat jij écht kunt geven.",
		options: [
			{ label: "Dagelijks", value: "daily" },
			{ label: "Wekelijks", value: "weekly" },
			{ label: "Maakt niet uit", value: "either" },
		],
	},
];

const RegisterFlow = ({ onComplete }: RegisterFlowProps) => {
	const insets = useSafeAreaInsets();
	const [step, setStep] = useState<Step>("intro");
	const [answers, setAnswers] = useState<(string | null)[]>([null, null, null, null]);
	const [selectedVeg, setSelectedVeg] = useState<VegetableInfo | null>(null);
	const [plantName, setPlantName] = useState("");
	const [probeName, setProbeName] = useState("");
	const [copied, setCopied] = useState(false);
	const [finderStep, setFinderStep] = useState(0);

	const goBack = () => {
		if (step === "finder") {
			if (finderStep === 0) setStep("intro");
			else setFinderStep(finderStep - 1);
	} else if (typeof step === "object" && step.type === "step5") {
		if (step.sub === 0) setStep("step4");
		else setStep({ type: "step5", sub: step.sub - 1 });
	} else {
			switch (step) {
				case "intro": break;
				case "results": setFinderStep(3); setStep("finder"); break;
				case "step1": setStep("results"); break;
				case "step2": setStep("step1"); break;
				case "step3": setStep("step2"); break;
				case "step4": setStep("step3"); break;
			}
		}
	};

	const setAnswer = (value: string) => {
		const next = [...answers];
		next[finderStep] = value;
		setAnswers(next);
	};

	const handleNextQuestion = () => {
		if (answers[finderStep] === null) return;
		if (finderStep < QUESTIONS.length - 1) {
			setFinderStep(finderStep + 1);
		} else {
			setStep("results");
		}
	};

	const getFilteredResults = (): VegetableInfo[] => {
		const [placement, sunlight, month, careLevel] = answers as string[];
		const monthNum = parseInt(month, 10);
		return VEGETABLES.filter((v) => {
			const d = VEGETABLE_DETAILS[v.id];
			if (!d) return false;
			if (placement !== "either" && d.placement !== "both" && d.placement !== placement) return false;
			if (sunlight !== d.sunlight) return false;
			if (monthNum < d.sowingPeriod.startMonth || monthNum > d.sowingPeriod.endMonth) return false;
			if (careLevel !== "either" && d.careLevel !== careLevel) return false;
			return true;
		});
	};

	const handleCopyCode = async () => {
		await Clipboard.setStringAsync(PAIRING_CODE);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	const renderContent = () => {
		if (step === "finder") {
			const currentQ = QUESTIONS[finderStep];
			const qIndex = finderStep;
			const isMonth = currentQ.options.length > 6;
			const canContinue = answers[qIndex] !== null;

			return (
				<View style={styles.content}>
					<ProgressBar fraction={qIndex / (QUESTIONS.length - 1)} />
					<Spacer space={Styling.Spacing.reg} />
					<View style={styles.finderHeader}>
						<TouchableOpacity onPress={goBack} style={styles.backBtn} activeOpacity={0.7}>
							<StyledIcon Icon={BackIcon} size="med" fill={Styling.Colors.white} />
						</TouchableOpacity>
						<StyledText type="head1" style={styles.finderTitle}>{currentQ.title}</StyledText>
					</View>
					<Spacer space={Styling.Spacing.med} />
					<View style={styles.finderContentPad}>
						<StyledText type="paragh" style={styles.explanation}>
							{currentQ.explanation}
						</StyledText>
						<Spacer space={Styling.Spacing.reg} />
						{isMonth ? (
							<View style={styles.monthGrid}>
								{currentQ.options.map((opt) => (
									<TouchableOpacity
										key={opt.value}
										style={[styles.monthBtn, answers[qIndex] === opt.value && styles.monthBtnSelected]}
										onPress={() => setAnswer(opt.value)}
										activeOpacity={0.7}
									>
										<StyledText type="paragh" style={[styles.monthBtnText, answers[qIndex] === opt.value && styles.monthBtnTextSelected]}>
											{opt.label}
										</StyledText>
									</TouchableOpacity>
								))}
							</View>
						) : (
							<View style={styles.optionList}>
								{currentQ.options.map((opt) => (
									<OptionButton key={opt.value} label={opt.label} selected={answers[qIndex] === opt.value} onPress={() => setAnswer(opt.value)} />
								))}
							</View>
						)}
						<Spacer space={Styling.Spacing.lrg} />
						<TouchableOpacity style={[styles.nextBtn, !canContinue && styles.nextBtnDisabled]} onPress={handleNextQuestion} disabled={!canContinue} activeOpacity={0.7}>
							<StyledText type="head4" style={{ color: canContinue ? Styling.Colors.white : Styling.Colors.lightGrey }}>
								{qIndex === QUESTIONS.length - 1 ? "Bekijk resultaten" : "Volgende"}
							</StyledText>
						</TouchableOpacity>
					</View>
				</View>
			);
		}

		switch (step) {
			case "intro":
				return (
					<View style={styles.centeredContent}>
						<StyledText type="head1" style={{ color: Styling.Colors.white, textAlign: "center" }}>We gaan de beste plant voor je zoeken!</StyledText>
						<Spacer space={Styling.Spacing.reg} />
						<StyledText type="paragh" style={{ color: Styling.Colors.white, textAlign: "center", lineHeight: 22, paddingHorizontal: 16 }}>
							Beantwoord een paar vragen en we vinden een plant die perfect bij jou past.
						</StyledText>
						<Spacer space={Styling.Spacing.xlg} />
						<TouchableOpacity style={styles.greenBtn} onPress={() => { setFinderStep(0); setStep("finder"); }} activeOpacity={0.7}>
							<StyledText type="head4" style={{ color: Styling.Colors.white }}>Starten</StyledText>
						</TouchableOpacity>
					</View>
				);

			case "results": {
				const results = getFilteredResults();
				return (
					<View style={styles.content}>
						<View style={styles.finderHeader}>
							<TouchableOpacity onPress={goBack} style={styles.backBtn} activeOpacity={0.7}>
								<StyledIcon Icon={BackIcon} size="med" fill={Styling.Colors.white} />
							</TouchableOpacity>
							<StyledText type="head1" style={styles.finderTitle}>Resultaten</StyledText>
						</View>
						<StyledText type="paragh" style={{ color: Styling.Colors.white, textAlign: "center", paddingHorizontal: 16, marginBottom: 16 }}>
							{results.length > 0 ? `We vonden ${results.length} geschikte ${results.length === 1 ? "plant" : "planten"} voor jou!` : "Geen resultaten gevonden."}
						</StyledText>
						{results.length > 0 ? (
							<CardContainer data={results} onItemPress={(id) => { const v = VEGETABLES.find((x) => x.id === id); if (v) setSelectedVeg(v); setStep("step1"); }} />
						) : (
							<StyledText type="paragh" style={{ color: Styling.Colors.white, textAlign: "center" }}>Probeer andere antwoorden.</StyledText>
						)}
					</View>
				);
			}

			case "step1": {
				const veg = selectedVeg ? VEGETABLE_DETAILS[selectedVeg.id] : null;
				if (!veg) return null;
				return (
					<View style={styles.content}>
						<View style={styles.finderHeader}>
							<TouchableOpacity onPress={goBack} style={styles.backBtn} activeOpacity={0.7}>
								<StyledIcon Icon={BackIcon} size="med" fill={Styling.Colors.white} />
							</TouchableOpacity>
							<StyledText type="head1" style={styles.finderTitle}>Klaar om te planten?</StyledText>
						</View>
						<View style={styles.checklistRow}>
							<Image source={veg.image} style={styles.vegImage} resizeMode="contain" />
							<View style={styles.checklistItems}>
								<StyledText type="head3" style={{ color: Styling.Colors.white }}>Je hebt nodig:</StyledText>
								<StyledText type="paragh" style={{ color: Styling.Colors.white, paddingVertical: 4 }}>{veg.name.toLowerCase()}zaden</StyledText>
								<StyledText type="paragh" style={{ color: Styling.Colors.white, paddingVertical: 4 }}>Pot (min. {veg.potDepth} diep)</StyledText>
								<StyledText type="paragh" style={{ color: Styling.Colors.white, paddingVertical: 4 }}>Potgrond</StyledText>
								<StyledText type="paragh" style={{ color: Styling.Colors.white, paddingVertical: 4 }}>Opgeladen sonde</StyledText>
							</View>
						</View>
						<Spacer space={Styling.Spacing.xlg} />
						<TouchableOpacity style={styles.greenBtn} onPress={() => setStep("step2")} activeOpacity={0.7}>
							<StyledText type="head4" style={{ color: Styling.Colors.white }}>Ja, laten we gaan!</StyledText>
						</TouchableOpacity>
					</View>
				);
			}

			case "step2": {
				const veg = selectedVeg ? VEGETABLE_DETAILS[selectedVeg.id] : null;
				if (!veg) return null;
				const steps = [
					`Vul je pot tot 2 cm onder de rand met potgrond. Druk de grond niet aan.`,
					`Maak een gaatje in de grond van ${veg.sowingDepth} diep. Hou ${veg.sowingDistance} afstand tussen de gaatjes of 1 per pot.`,
					`Leg het zaadje in het gat. Dek het zaadje af met een dun laagje grond.`,
				];
				return (
					<View style={styles.content}>
						<View style={styles.finderHeader}>
							<TouchableOpacity onPress={goBack} style={styles.backBtn} activeOpacity={0.7}>
								<StyledIcon Icon={BackIcon} size="med" fill={Styling.Colors.white} />
							</TouchableOpacity>
							<StyledText type="head1" style={styles.finderTitle}>{veg.name} zaaien</StyledText>
						</View>
						{steps.map((s, i) => (
							<View key={i} style={{ width: "100%", paddingVertical: 8 }}>
								<StyledText type="head3" style={{ color: Styling.Colors.white, marginBottom: 4 }}>Stap {i + 1}</StyledText>
								<StyledText type="paragh" style={{ color: Styling.Colors.white, lineHeight: 22 }}>{s}</StyledText>
							</View>
						))}
						<Spacer space={Styling.Spacing.xlg} />
						<TouchableOpacity style={styles.greenBtn} onPress={() => setStep("step3")} activeOpacity={0.7}>
							<StyledText type="head4" style={{ color: Styling.Colors.white }}>Klaar!</StyledText>
						</TouchableOpacity>
					</View>
				);
			}

			case "step3": {
				const veg = selectedVeg ? VEGETABLE_DETAILS[selectedVeg.id] : null;
				if (!veg) return null;
				return (
					<View style={styles.content}>
						<View style={styles.finderHeader}>
							<TouchableOpacity onPress={goBack} style={styles.backBtn} activeOpacity={0.7}>
								<StyledIcon Icon={BackIcon} size="med" fill={Styling.Colors.white} />
							</TouchableOpacity>
							<StyledText type="head1" style={styles.finderTitle}>Geef je plant een naam</StyledText>
						</View>
						<StyledText type="paragh" style={{ color: Styling.Colors.white, textAlign: "center" }}>
							Kies een leuke naam voor je {veg.name.toLowerCase()}
						</StyledText>
						<Spacer space={Styling.Spacing.reg} />
						<TextInput style={styles.input} value={plantName} onChangeText={setPlantName} placeholder={`Mijn ${veg.name.toLowerCase()}`} placeholderTextColor={Styling.Colors.lightGrey} maxLength={30} />
						<Spacer space={Styling.Spacing.xlg} />
						<TouchableOpacity style={[styles.nextBtn, !plantName.trim() && styles.nextBtnDisabled]} onPress={() => plantName.trim() && setStep("step4")} disabled={!plantName.trim()} activeOpacity={0.7}>
							<StyledText type="head4" style={{ color: plantName.trim() ? Styling.Colors.white : Styling.Colors.lightGrey }}>Volgende</StyledText>
						</TouchableOpacity>
					</View>
				);
			}

			case "step4":
				return (
					<View style={styles.content}>
						<View style={styles.finderHeader}>
							<TouchableOpacity onPress={goBack} style={styles.backBtn} activeOpacity={0.7}>
								<StyledIcon Icon={BackIcon} size="med" fill={Styling.Colors.white} />
							</TouchableOpacity>
							<StyledText type="head1" style={styles.finderTitle}>Koppel je sonde</StyledText>
						</View>
						<StyledText type="paragh" style={{ color: Styling.Colors.white, textAlign: "center", lineHeight: 22 }}>
							We hebben een sonde nodig om de groei van je plant te volgen. We gaan je nu stap voor stap helpen met het instellen.
						</StyledText>
						<Spacer space={Styling.Spacing.xlg} />
						<TouchableOpacity style={styles.greenBtn} onPress={() => setStep({ type: "step5", sub: 0 })} activeOpacity={0.7}>
							<StyledText type="head4" style={{ color: Styling.Colors.white }}>Start instellen</StyledText>
						</TouchableOpacity>
					</View>
				);

			case "done":
				return null;

			default:
				if (typeof step === "object" && step.type === "step5") {
					const sub = step.sub;
					return (
						<View style={styles.content}>
							<View style={styles.finderHeader}>
								<TouchableOpacity onPress={goBack} style={styles.backBtn} activeOpacity={0.7}>
									<StyledIcon Icon={BackIcon} size="med" fill={Styling.Colors.white} />
								</TouchableOpacity>
								<StyledText type="head1" style={styles.finderTitle}>Sonde instellen</StyledText>
							</View>
							<Spacer space={Styling.Spacing.sml} />

							{sub === 0 && (
								<>
									<StyledText type="head3" style={styles.stepTitle}>Stap 1: Sonde opladen</StyledText>
									<StyledText type="paragh" style={{ color: Styling.Colors.white, lineHeight: 22, marginTop: 8 }}>
										Sluit je sonde via USB aan op de oplader. Zodra hij stroom krijgt, kun je hem straks instellen.
									</StyledText>
									<Spacer space={Styling.Spacing.xlg} />
									<TouchableOpacity style={styles.greenBtn} onPress={() => setStep({ type: "step5", sub: 1 })} activeOpacity={0.7}>
										<StyledText type="head4" style={{ color: Styling.Colors.white }}>Volgende</StyledText>
									</TouchableOpacity>
								</>
							)}

							{sub === 1 && (
								<>
									<StyledText type="head3" style={styles.stepTitle}>Stap 2: Verbinden met je sonde</StyledText>
									<Spacer space={Styling.Spacing.sml} />
									<GuideRow num="1." text="Zoek je WiFi-naam en wachtwoord op. Je hebt ze zo dadelijk nodig." />
									<View style={styles.guideRow}>
										<StyledText type="paragh" style={{ color: Styling.Colors.green, width: 20 }}>2.</StyledText>
										<StyledText type="paragh" style={{ color: Styling.Colors.white, flex: 1, lineHeight: 22 }}>
											Ga naar je WiFi-instellingen en verbind met het netwerk <StyledText type="paragh" style={{ color: Styling.Colors.green }}>SproutSpot-Setup</StyledText>.
										</StyledText>
									</View>
									<View style={styles.guideRow}>
										<StyledText type="paragh" style={{ color: Styling.Colors.green, width: 20 }}>3.</StyledText>
										<StyledText type="paragh" style={{ color: Styling.Colors.white, flex: 1, lineHeight: 22 }}>
											Open je browser en ga naar <StyledText type="paragh" style={{ color: Styling.Colors.green }}>sproutspot.local</StyledText>.
										</StyledText>
									</View>
									<GuideRow num="4." text="Vul daar je WiFi-naam, wachtwoord en onderstaande koppelcode in." />
									<TouchableOpacity style={styles.codeBox} onPress={handleCopyCode} activeOpacity={0.7}>
										<StyledText type="smParagh" style={{ color: Styling.Colors.lightGrey, marginBottom: 4 }}>
											{copied ? "Gekopieerd!" : "Klik hier om je koppelcode te kopiëren"}
										</StyledText>
										<StyledText type="head3" style={{ color: Styling.Colors.green, letterSpacing: 2 }}>{PAIRING_CODE}</StyledText>
									</TouchableOpacity>
									<Spacer space={Styling.Spacing.reg} />
									<TouchableOpacity style={styles.greenBtn} onPress={() => setStep({ type: "step5", sub: 2 })} activeOpacity={0.7}>
										<StyledText type="head4" style={{ color: Styling.Colors.white }}>Volgende</StyledText>
									</TouchableOpacity>
								</>
							)}

							{sub === 2 && (
								<>
									<StyledText type="head3" style={styles.stepTitle}>Stap 3: Terug naar je eigen WiFi</StyledText>
									<StyledText type="paragh" style={{ color: Styling.Colors.white, lineHeight: 22, marginTop: 8 }}>
										Ga terug naar je WiFi-instellingen en verbind weer met je thuisnetwerk. De sonde is nu ingesteld en zal vanzelf verbinding maken.
									</StyledText>
									<Spacer space={Styling.Spacing.xlg} />
									<TouchableOpacity style={styles.greenBtn} onPress={() => setStep({ type: "step5", sub: 3 })} activeOpacity={0.7}>
										<StyledText type="head4" style={{ color: Styling.Colors.white }}>Volgende</StyledText>
									</TouchableOpacity>
								</>
							)}

							{sub === 3 && (
								<>
									<StyledText type="head3" style={styles.stepTitle}>Stap 4: Geef je sonde een naam</StyledText>
									<StyledText type="paragh" style={{ color: Styling.Colors.white, lineHeight: 22, marginTop: 8 }}>
										Kies een herkenbare naam voor je sonde.
									</StyledText>
									<Spacer space={Styling.Spacing.reg} />
									<TextInput style={styles.input} value={probeName} onChangeText={setProbeName} placeholder="Naam van je sonde" placeholderTextColor={Styling.Colors.lightGrey} maxLength={30} />
									<Spacer space={Styling.Spacing.reg} />
									<StyledText type="head3" style={styles.stepTitle}>Stap 5: Sonde planten</StyledText>
									<GuideRow num="1." text="Zorg dat de sonde volledig is opgeladen." />
									<GuideRow num="2." text="Plaats de sonde 5 cm naast de zaaiplek. Zorg dat de sonde 4 cm diep steekt." />
									<Spacer space={Styling.Spacing.xlg} />
									<TouchableOpacity style={[styles.greenBtn, !probeName.trim() && { opacity: 0.4 }]} onPress={() => { if (probeName.trim() && selectedVeg) { onComplete(selectedVeg.id, plantName); setStep("done"); } }} activeOpacity={0.7} disabled={!probeName.trim()}>
										<StyledText type="head4" style={{ color: Styling.Colors.white }}>Naar de tuin!</StyledText>
									</TouchableOpacity>
								</>
							)}
						</View>
					);
				}
				return null;
		}
	};

	return (
		<StyledView style={[styles.container, { paddingTop: insets.top + 20 }]}>
			{renderContent()}
		</StyledView>
	);
};

const GuideRow = ({ num, text }: { num: string; text: string }) => (
	<View style={styles.guideRow}>
		<StyledText type="paragh" style={{ color: Styling.Colors.green, width: 20 }}>{num}</StyledText>
		<StyledText type="paragh" style={{ color: Styling.Colors.white, flex: 1, lineHeight: 22 }}>{text}</StyledText>
	</View>
);

export default RegisterFlow;

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	content: {
		flex: 1,
		alignItems: "center",
		marginTop: -25,
	},
	centeredContent: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	backBtn: {
		position: "absolute",
		left: 0,
		zIndex: 1,
	},
	finderHeader: {
		width: "100%",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		minHeight: 56,
		paddingVertical: 12,
	},
	finderTitle: {
		color: Styling.Colors.white,
		textAlign: "center",
		textAlignVertical: "center",
		flexShrink: 1,
		paddingHorizontal: 50,
	},
	greenBtn: {
		backgroundColor: Styling.Colors.green,
		borderRadius: Styling.BorderRadius.reg,
		paddingHorizontal: Styling.Padding.lrg,
		paddingVertical: Styling.Padding.sml,
	},
	nextBtn: {
		backgroundColor: Styling.Colors.green,
		borderRadius: Styling.BorderRadius.reg,
		paddingHorizontal: Styling.Padding.lrg,
		paddingVertical: Styling.Padding.sml,
	},
	nextBtnDisabled: {
		backgroundColor: "transparent",
		borderWidth: 1,
		borderColor: Styling.Colors.lightGrey,
	},
	finderContentPad: {
		alignItems: "center",
		width: "100%",
	},
	explanation: {
		color: Styling.Colors.white,
		textAlign: "center",
		lineHeight: 22,
	},
	optionList: {
		width: "100%",
		gap: Styling.Spacing.sml,
	},
	monthGrid: {
		width: "100%",
		flexDirection: "row",
		flexWrap: "wrap",
		gap: Styling.Spacing.xsm,
		justifyContent: "center",
	},
	monthBtn: {
		width: "30%",
		borderWidth: 1,
		borderColor: Styling.Colors.white,
		borderRadius: Styling.BorderRadius.reg,
		paddingVertical: Styling.Padding.xsm,
		alignItems: "center",
	},
	monthBtnSelected: {
		backgroundColor: Styling.Colors.green,
		borderColor: Styling.Colors.green,
	},
	monthBtnText: {
		color: Styling.Colors.white,
		fontSize: Styling.Fonts.Size.reg,
	},
	monthBtnTextSelected: {
		color: Styling.Colors.white,
	},
	checklistRow: {
		flexDirection: "row",
		gap: Styling.Spacing.med,
		width: "100%",
		justifyContent: "center",
		marginTop: 24,
	},
	vegImage: {
		width: 120,
		height: 120,
	},
	checklistItems: {
		justifyContent: "center",
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
	guideRow: {
		flexDirection: "row",
		gap: Styling.Spacing.sml,
		paddingVertical: Styling.Padding.sml,
		alignItems: "flex-start",
	},
	codeBox: {
		width: "100%",
		alignItems: "center",
		paddingVertical: Styling.Padding.reg,
		borderWidth: 1,
		borderColor: Styling.Colors.green,
		borderRadius: Styling.BorderRadius.reg,
		backgroundColor: Styling.Colors.darkGrey,
		marginTop: 16,
	},
	stepTitle: {
		color: Styling.Colors.white,
		alignSelf: "flex-start",
	},
});
