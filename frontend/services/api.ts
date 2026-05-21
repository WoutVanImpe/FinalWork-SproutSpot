import Constants from "expo-constants";

const BASE_URL = (Constants.expoConfig?.extra?.apiBaseUrl as string) ?? "http://localhost:5001";

let authToken: string | null = null;

export function setToken(token: string | null) {
	authToken = token;
}

export function clearToken() {
	authToken = null;
}

export function getToken(): string | null {
	return authToken;
}

export interface ApiResult<T> {
	success: boolean;
	data?: T;
	message?: string;
	count?: number;
}

async function handleResponse<T>(response: Response): Promise<ApiResult<T>> {
	const json = await response.json();
	if (!response.ok) {
		throw new Error(json.message || "Request failed");
	}
	return json as ApiResult<T>;
}

export const api = {
	get: <T>(path: string) => {
		const headers: Record<string, string> = {};
		if (authToken) headers["Authorization"] = `Bearer ${authToken}`;
		return fetch(`${BASE_URL}${path}`, { method: "GET", headers }).then((r) => handleResponse<T>(r));
	},
	post: <T>(path: string, body?: Record<string, unknown>) => {
		const headers: Record<string, string> = { "Content-Type": "application/json" };
		if (authToken) headers["Authorization"] = `Bearer ${authToken}`;
		return fetch(`${BASE_URL}${path}`, { method: "POST", headers, body: body ? JSON.stringify(body) : undefined }).then((r) => handleResponse<T>(r));
	},
	put: <T>(path: string, body?: Record<string, unknown>) => {
		const headers: Record<string, string> = { "Content-Type": "application/json" };
		if (authToken) headers["Authorization"] = `Bearer ${authToken}`;
		return fetch(`${BASE_URL}${path}`, { method: "PUT", headers, body: body ? JSON.stringify(body) : undefined }).then((r) => handleResponse<T>(r));
	},
	delete: <T>(path: string) => {
		const headers: Record<string, string> = {};
		if (authToken) headers["Authorization"] = `Bearer ${authToken}`;
		return fetch(`${BASE_URL}${path}`, { method: "DELETE", headers }).then((r) => handleResponse<T>(r));
	},
};
