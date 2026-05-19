import { api } from "./api";

export interface LoginResponse {
	id: number;
	name: string;
	email: string;
	token: string;
}

export interface SignupResponse {
	id: number;
	name: string;
	email: string;
	pairing_code: string;
	token: string;
	created_at: string;
}

export interface UserProfile {
	id: number;
	name: string;
	email: string;
	profile_picture: string | null;
	push_token: string | null;
	pairing_code: string;
	notification_window_start: string;
	notification_window_end: string;
	created_at: string;
}

export function loginUser(email: string, password: string) {
	return api.post<LoginResponse>("/api/users/login", { email, password });
}

export function signupUser(name: string, email: string, password: string) {
	return api.post<SignupResponse>("/api/users/signup", { name, email, password });
}

export function getProfile() {
	return api.get<UserProfile>("/api/users/profile");
}

export function updateProfile(data: {
	name?: string;
	push_token?: string;
	notification_window_start?: string;
	notification_window_end?: string;
}) {
	return api.put<UserProfile>("/api/users/profile", data);
}

export function changePassword(current_password: string, new_password: string) {
	return api.put<void>("/api/users/password", { current_password, new_password });
}
