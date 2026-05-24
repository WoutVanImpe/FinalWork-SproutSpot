import { Keyboard, ScrollView, StyleSheet, TextInput, TouchableOpacity, View, LayoutChangeEvent, ActivityIndicator } from "react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Styling } from "../../constants/Styling";
import StyledText from "../style/StyledText";
import StyledButton from "../style/StyledButton";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";

interface AuthScreenProps {
	onComplete: (mode: "login" | "register") => void;
}

const PASSWORD_RULES = [
	{ label: "Minimaal 8 tekens", test: (v: string) => v.length >= 8 },
	{ label: "Minimaal 1 hoofdletter", test: (v: string) => /[A-Z]/.test(v) },
	{ label: "Minimaal 1 kleine letter", test: (v: string) => /[a-z]/.test(v) },
	{ label: "Minimaal 1 cijfer", test: (v: string) => /\d/.test(v) },
	{ label: "Minimaal 1 speciaal teken", test: (v: string) => /[!@#$%^&*(),.?":{}|<>_]/.test(v) },
];

const AuthScreen = ({ onComplete }: AuthScreenProps) => {
	const insets = useSafeAreaInsets();
	const scrollRef = useRef<ScrollView>(null);
	const { login, signup, loading } = useAuth();
	const [isRegister, setIsRegister] = useState(true);
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [repeatPassword, setRepeatPassword] = useState("");
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [apiError, setApiError] = useState("");
	const [keyboardPadding, setKeyboardPadding] = useState(0);
	const inputYPositions = useRef<Record<string, number>>({});
	const formY = useRef(0);

	useEffect(() => {
		const showSub = Keyboard.addListener("keyboardDidShow", (e) => {
			setKeyboardPadding(e.endCoordinates.height + 20);
		});
		const hideSub = Keyboard.addListener("keyboardDidHide", () => {
			setKeyboardPadding(0);
		});
		return () => {
			showSub.remove();
			hideSub.remove();
		};
	}, []);

	const scrollToInput = useCallback((field: string) => {
		const y = inputYPositions.current[field];
		if (y === undefined) return;
		const scrollTarget = Math.max(0, formY.current + y - 160);
		scrollRef.current?.scrollTo({ y: scrollTarget, animated: true });
	}, []);

	const currentRuleIdx = PASSWORD_RULES.findIndex((r) => !r.test(password));

	const validate = (): boolean => {
		const newErrors: Record<string, string> = {};

		if (isRegister && !name.trim()) newErrors.name = "Naam is verplicht";
		else if (isRegister && name.trim().length < 2) newErrors.name = "Naam moet minstens 2 letters bevatten";
		else if (isRegister && !/^[a-zA-Z]+$/.test(name.trim())) newErrors.name = "Naam mag alleen letters bevatten";
		if (!email.trim()) newErrors.email = "E-mail is verplicht";
		else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = "Ongeldig e-mailadres";
		if (!password) newErrors.password = "Wachtwoord is verplicht";
		else if (isRegister && !PASSWORD_RULES.every((r) => r.test(password))) newErrors.password = "Niet alle vereisten zijn voldaan";
		if (isRegister && password !== repeatPassword) newErrors.repeatPassword = "Wachtwoorden komen niet overeen";

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async () => {
		if (!validate()) return;
		setApiError("");
		try {
			if (isRegister) {
				await signup(name.trim(), email.trim(), password);
			} else {
				await login(email.trim(), password);
			}
			onComplete(isRegister ? "register" : "login");
		} catch (err) {
			setApiError((err as Error).message);
		}
	};

	const toggleMode = () => {
		setIsRegister(!isRegister);
		setErrors({});
		setApiError("");
	};

	const inputStyle = (field: string) => [styles.input, errors[field] && { borderColor: Styling.Colors.red }];

	return (
		<View style={[styles.container]}>
			<ScrollView ref={scrollRef} contentContainerStyle={[styles.scrollContent, { paddingBottom: keyboardPadding }, { paddingTop: insets.top + 40 }]} keyboardShouldPersistTaps="handled" bounces={false} showsVerticalScrollIndicator={false}>
				<View style={styles.header}>
					<StyledText type="head1" style={{ color: Styling.Colors.green, textAlign: "center" }}>
						SproutSpot
					</StyledText>
					<StyledText type="head4" style={{ color: Styling.Colors.white, marginTop: 4 }}>
						{isRegister ? "Maak een account aan" : "Welkom terug"}
					</StyledText>
				</View>

				<View style={styles.toggleRow}>
					<TouchableOpacity style={[styles.togglePill, isRegister && styles.toggleActive]} onPress={() => !isRegister && toggleMode()} activeOpacity={0.7}>
						<StyledText type="head4" style={{ color: Styling.Colors.white }}>
							Registreren
						</StyledText>
					</TouchableOpacity>
					<TouchableOpacity style={[styles.togglePill, !isRegister && styles.toggleActive]} onPress={() => isRegister && toggleMode()} activeOpacity={0.7}>
						<StyledText type="head4" style={{ color: Styling.Colors.white }}>
							Inloggen
						</StyledText>
					</TouchableOpacity>
				</View>

				<View
					style={styles.form}
					onLayout={(e: LayoutChangeEvent) => {
						formY.current = e.nativeEvent.layout.y;
					}}
				>
					{isRegister && (
						<View
							onLayout={(e: LayoutChangeEvent) => {
								inputYPositions.current["name"] = e.nativeEvent.layout.y;
							}}
						>
							<TextInput
								style={inputStyle("name")}
								value={name}
								onChangeText={(v) => {
									setName(v);
									setErrors((e) => ({ ...e, name: "" }));
								}}
								placeholder="Naam"
								placeholderTextColor={Styling.Colors.white}
								autoCapitalize="words"
								onFocus={() => scrollToInput("name")}
							/>
							{errors.name && (
								<StyledText type="smParagh" style={styles.error}>
									{errors.name}
								</StyledText>
							)}
						</View>
					)}

					<View
						onLayout={(e: LayoutChangeEvent) => {
							inputYPositions.current["email"] = e.nativeEvent.layout.y;
						}}
					>
						<TextInput
							style={inputStyle("email")}
							value={email}
							onChangeText={(v) => {
								setEmail(v);
								setErrors((e) => ({ ...e, email: "" }));
							}}
							placeholder="E-mail"
							placeholderTextColor={Styling.Colors.white}
							keyboardType="email-address"
							autoCapitalize="none"
							onFocus={() => scrollToInput("email")}
						/>
						{errors.email && (
							<StyledText type="smParagh" style={styles.error}>
								{errors.email}
							</StyledText>
						)}
					</View>

					<View
						onLayout={(e: LayoutChangeEvent) => {
							inputYPositions.current["password"] = e.nativeEvent.layout.y;
						}}
					>
						<TextInput
							style={inputStyle("password")}
							value={password}
							onChangeText={(v) => {
								setPassword(v);
								setErrors((e) => ({ ...e, password: "" }));
							}}
							placeholder="Wachtwoord"
							placeholderTextColor={Styling.Colors.white}
							secureTextEntry
							onFocus={() => scrollToInput("password")}
						/>
						{errors.password && (
							<StyledText type="smParagh" style={styles.error}>
								{errors.password}
							</StyledText>
						)}
					</View>

					{isRegister && password.length > 0 && currentRuleIdx !== -1 && (
						<View style={styles.rulesContainer}>
							<View style={styles.ruleRow}>
								<StyledText type="smParagh" style={{ color: Styling.Colors.green }}>
									○ {PASSWORD_RULES[currentRuleIdx].label}
								</StyledText>
							</View>
						</View>
					)}

					{isRegister && (
						<>
							<View
								onLayout={(e: LayoutChangeEvent) => {
									inputYPositions.current["repeatPassword"] = e.nativeEvent.layout.y;
								}}
							>
								<TextInput
									style={inputStyle("repeatPassword")}
									value={repeatPassword}
									onChangeText={(v) => {
										setRepeatPassword(v);
										setErrors((e) => ({ ...e, repeatPassword: "" }));
									}}
									placeholder="Herhaal wachtwoord"
									placeholderTextColor={Styling.Colors.white}
									secureTextEntry
									onFocus={() => scrollToInput("repeatPassword")}
								/>
								{errors.repeatPassword && (
									<StyledText type="smParagh" style={styles.error}>
										{errors.repeatPassword}
									</StyledText>
								)}
							</View>
						</>
					)}
				</View>

				{apiError ? (
					<StyledText type="smParagh" style={styles.apiError}>
						{apiError}
					</StyledText>
				) : null}
				<View style={styles.submitWrapper}>
					<TouchableOpacity onPress={handleSubmit} activeOpacity={0.8} disabled={loading}>
						<StyledButton>
							{loading ? (
								<ActivityIndicator color={Styling.Colors.white} />
							) : isRegister ? (
								"Account aanmaken"
							) : (
								"Inloggen"
							)}
						</StyledButton>
					</TouchableOpacity>
				</View>
			</ScrollView>
		</View>
	);
};

export default AuthScreen;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingHorizontal: 24,
		backgroundColor: Styling.Colors.gradGrey,
	},
	scrollContent: {
		flexGrow: 1,
	},
	header: {
		alignItems: "center",
		marginTop: 40,
		marginBottom: 32,
	},
	toggleRow: {
		flexDirection: "row",
		backgroundColor: "rgba(255,255,255,0.1)",
		borderRadius: Styling.BorderRadius.reg,
		padding: 4,
		marginBottom: 24,
	},
	togglePill: {
		flex: 1,
		paddingVertical: 10,
		alignItems: "center",
		borderRadius: Styling.BorderRadius.reg - 2,
	},
	toggleActive: {
		backgroundColor: Styling.Colors.green,
	},
	form: {
		gap: 16,
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
	error: {
		color: Styling.Colors.red,
		marginTop: -12,
	},
	rulesContainer: {
		marginTop: -8,
	},
	ruleRow: {
		paddingLeft: 4,
	},
	apiError: {
		color: Styling.Colors.red,
		textAlign: "center",
		marginTop: 16,
	},
	submitWrapper: {
		marginTop: 32,
	},
});
