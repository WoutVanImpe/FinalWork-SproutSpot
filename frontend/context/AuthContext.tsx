import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { setToken as setApiToken, clearToken as clearApiToken } from "../services/api";
import { loginUser, signupUser, getProfile, updateProfile, type UserProfile } from "../services/auth";
import { registerForPushNotificationsAsync } from "../utils/notifications";

const TOKEN_KEY = "auth_token";

interface AuthContextValue {
	user: UserProfile | null;
	token: string | null;
	loading: boolean;
	login: (email: string, password: string) => Promise<void>;
	signup: (name: string, email: string, password: string) => Promise<void>;
	logout: () => void;
	refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<UserProfile | null>(null);
	const [token, setTokenState] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		(async () => {
			try {
				const saved = await SecureStore.getItemAsync(TOKEN_KEY);
				if (saved) {
					setTokenState(saved);
					setApiToken(saved);
					const res = await getProfile();
					if (res.data) {
						setUser(res.data);
						syncPushToken(res.data.push_token);
					}
				}
			} catch {
				await SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {});
			} finally {
				setLoading(false);
			}
		})();
	}, []);

	const login = useCallback(async (email: string, password: string) => {
		setLoading(true);
		try {
			const res = await loginUser(email, password);
			if (res.data) {
				setTokenState(res.data.token);
				setApiToken(res.data.token);
				await SecureStore.setItemAsync(TOKEN_KEY, res.data.token);
				setUser({ id: res.data.id, name: res.data.name, email: res.data.email, profile_picture: null, push_token: null, push_enabled: true, pairing_code: "", notification_window_start: "", notification_window_end: "", created_at: "" });
				syncPushToken(null);
			}
		} finally {
			setLoading(false);
		}
	}, []);

	const signup = useCallback(async (name: string, email: string, password: string) => {
		setLoading(true);
		try {
			const res = await signupUser(name, email, password);
			if (res.data) {
				setTokenState(res.data.token);
				setApiToken(res.data.token);
				await SecureStore.setItemAsync(TOKEN_KEY, res.data.token);
				setUser({ id: res.data.id, name: res.data.name, email: res.data.email, profile_picture: null, push_token: null, push_enabled: true, pairing_code: res.data.pairing_code, notification_window_start: "", notification_window_end: "", created_at: res.data.created_at });
				syncPushToken(null);
			}
		} finally {
			setLoading(false);
		}
	}, []);

	const logout = useCallback(() => {
		setTokenState(null);
		clearApiToken();
		setUser(null);
		SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {});
	}, []);

	const syncPushToken = async (currentToken: string | null) => {
		try {
			console.log("[Push] syncPushToken called, currentToken:", currentToken);
			const expoPushToken = await registerForPushNotificationsAsync();
			console.log("[Push] Got push token:", expoPushToken);
			if (expoPushToken && expoPushToken !== currentToken) {
				console.log("[Push] Sending token to backend...");
				await updateProfile({ push_token: expoPushToken });
				console.log("[Push] Token saved!");
			}
		} catch (e) {
			console.error("[Push] Error:", e);
		}
	};

	const refreshProfile = useCallback(async () => {
		try {
			const res = await getProfile();
			if (res.data) setUser(res.data);
		} catch {
			// ignore
		}
	}, []);

	const value = useMemo(() => ({ user, token, loading, login, signup, logout, refreshProfile }), [user, token, loading, login, signup, logout, refreshProfile]);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error("useAuth must be used within AuthProvider");
	return ctx;
}
