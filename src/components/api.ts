import {IUser} from "../server/interfaces";
import Router from "next/router";
import fetch from "isomorphic-unfetch";
import nextCookie from "next-cookies";

const makeAPIRequest = async (url: string, method: string, data: any, ctx?: any) => {
	let token = "";
	let apiUrl = "";

	if (ctx) {
		token = nextCookie(ctx)["connect.sid"] || "";
		apiUrl = (ctx?.req ? ctx.req.protocol + "://" + ctx.req.get("host") : window.location.origin) + url;
	}

	console.log("making request to", url);
	try {
		const response = await fetch(ctx ? apiUrl : url, {
			method,
			headers: {
				"Content-Type": "application/json",
				...(ctx ? {cookie: `connect.sid=${token}`} : {}),
			},
			...(data ? {body: JSON.stringify(data)} : {}),
			...(ctx ? {credentials: "include"} : {}),
		});

		return await response.json();
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

export const getSettings = async (ctx: any) => {
	const result = await makeAPIRequest("/api/settings", "GET", null, ctx);

	if (result.status === 200) {
		return result.settings;
	} else {
		console.error("GET settings error: " + result.message);
		return [];
	}
};

export const getPeers = async (ctx: any) => {
	const result = await makeAPIRequest("/api/peers", "GET", null, ctx);

	if (result.status === 200) {
		return result.peers;
	} else {
		console.error("GET peers error: " + result.message);
		return [];
	}
};

export const getUsers = async (ctx: any) => {
	const result = await makeAPIRequest("/api/users", "GET", null, ctx);

	if (result.status === 200) {
		return result.users;
	} else {
		console.error("GET users error: " + result.message);
		return [];
	}
};
