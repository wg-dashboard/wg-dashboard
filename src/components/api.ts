import {IUser} from "../server/interfaces";
import Router from "next/router";

const makeAPIRequest = async (url: string, data: any) => {
	try {
		const request = await fetch(url, {
			method: "POST",
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
	const result = await makeAPIRequest("/api/login", data);

	if (result.status === 200 || result.message === "User already authenticated") {
		Router.push("/dashboard");
	} else {
		alert("Login error: " + result.message);
	}
};

export const logout = async () => {
	const result = await makeAPIRequest("/api/logout", null);

	if (result.status !== 200) {
		alert("Logout error: " + result.message);
	} else {
		Router.push("/");
	}
};
