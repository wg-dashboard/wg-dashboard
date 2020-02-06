import {IUser} from "../server/interfaces";
import Router from "next/router";

const makeAPIRequest = async (url: string, data: any) => {
	const request = await fetch(url, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(data),
	});

	return await request.json();
};

export const loginRegisterUser = async (data: IUser) => {
	const result = await makeAPIRequest("/api/login", data);

	if (result.status === 200 || result.message === "User already authenticated") {
		Router.push("/dashboard");
	} else {
		alert("Login Error: " + result.message);
	}
};
