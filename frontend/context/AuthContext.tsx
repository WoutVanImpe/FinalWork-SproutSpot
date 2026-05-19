import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import { setToken as setApiToken, clearToken as clearApiToken } from "../services/api";
import { loginUser, signupUser, getProfile, type UserProfile } from "../services/auth";

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
	const [loading, setLoading] = useState(false);

	const login = useCallback(async (email: string, password: string) => {
		setLoading(true);
		try {
			const res = await loginUser(email, password);
			if (res.data) {
				setTokenState(res.data.token);
				setApiToken(res.data.token);
				setUser({ id: res.data.id, name: res.data.name, email: res.data.email, profile_picture: null, push_token: null, pairing_code: "", notification_window_start: "", notification_window_end: "", created_at: "" });
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
				setUser({ id: res.data.id, name: res.data.name, email: res.data.email, profile_picture: null, push_token: null, pairing_code: res.data.pairing_code, notification_window_start: "", notification_window_end: "", created_at: res.data.created_at });
			}
		} finally {
			setLoading(false);
		}
	}, []);

	const logout = useCallback(() => {
		setTokenState(null);
		clearApiToken();
		setUser(null);
	}, []);

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
