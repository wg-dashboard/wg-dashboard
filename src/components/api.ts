import {IUser} from "../server/interfaces";
import Router from "next/router";
import fetch from "isomorphic-unfetch";

const makeAPIRequest = async (url: string, method: string, data: any) => {
	console.log("making request to", url);
	try {
		const request = await fetch(url, {
			method,
			headers: {
				"Content-Type": "application/json",
			},
			...(data ? {body: JSON.stringify(data)} : {}),
		});

		return await request.json();
	} catch (err) {
		console.error(err);
		return {
			status: 500,
			message: "Could not send request, please check the console for further details",
		};
	}
};

export const loginRegisterUser = async (data: IUser) => {
	const result = await makeAPIRequest("/api/login", "POST", data);

	if (result.status === 200 || result.message === "User already authenticated") {
		Router.push("/dashboard");
	} else {
		alert("Login error: " + result.message);
	}
};

export const logout = async () => {
	const result = await makeAPIRequest("/api/logout", "POST", null);

	if (result.status !== 200) {
		alert("Logout error: " + result.message);
	} else {
		Router.push("/");
	}
};

export const getSettings = async (basePath: string) => {
	const result = await makeAPIRequest(basePath + "/api/settings", "GET", null);

	if (result.status === 200) {
		return result.settings;
	} else {
		console.error("GET settings error: " + result.message);
		return [];
	}
};
