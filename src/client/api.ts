import {IUser, ISetting, IPeer} from "../server/interfaces";
import states from "./states/index";

const makeAPIRequest = async (url: string, method: string, data: any) => {
	console.log("making request to", url);
	states.user.setPageIsLoading(true);

	try {
		const response = await fetch(url, {
			method,
			headers: {
				"Content-Type": "application/json",
			},
			...(data ? {body: JSON.stringify(data)} : {}),
		});

		states.user.setPageIsLoading(false);
		return await response.json();
	} catch (err) {
		console.error(err);

		states.user.setPageIsLoading(false);
		return {
			status: 500,
			message: "Could not send request, please check the console for further details",
		};
	}
};

export const loginRegisterUser = async (data: IUser) => {
	const result = await makeAPIRequest("/api/login", "POST", data);

	if (result.status === 200 || result.message === "User already authenticated") {
		states.user.setLoggedIn(true);
		states.user.setAdmin(result.user.admin);
		states.user.setId(result.user.id);
		// Router.push("/dashboard");
	} else {
		alert("Login error: " + result.message);
	}
};

export const logout = async () => {
	const result = await makeAPIRequest("/api/logout", "POST", null);

	if (result.status !== 200) {
		alert("Logout error: " + result.message);
	} else {
		states.user.setLoggedIn(false);
	}
};

export const getSettings = async () => {
	const result = await makeAPIRequest("/api/settings", "GET", null);

	if (result.status === 200) {
		return result.settings;
	} else {
		console.error("GET settings error: " + result.message);
		return [];
	}
};

export const getPeers = async () => {
	const result = await makeAPIRequest("/api/peers", "GET", null);

	if (result.status === 200) {
		return result.peers;
	} else {
		console.error("GET peers error: " + result.message);
		return [];
	}
};

export const getUsers = async () => {
	const result = await makeAPIRequest("/api/users", "GET", null);

	if (result.status === 200) {
		return result.users;
	} else {
		console.error("GET users error: " + result.message);
		return [];
	}
};

/* ADMIN ENDPOINTS */
export const createUser = async (data: IUser) => {
	const result = await makeAPIRequest("/api/users", "POST", data);

	if (result.status !== 201) {
		throw new Error(result.message);
	} else {
		return result.user;
	}
};

export const deleteUser = async (id: number) => {
	const result = await makeAPIRequest("/api/users", "DELETE", {id});

	if (result.status !== 200) {
		throw new Error(result.message);
	} else {
		return id;
	}
};

export const updateUser = async (user: IUser) => {
	const result = await makeAPIRequest("/api/users", "PUT", {user});

	if (result.status !== 200) {
		throw new Error(result.message);
	}
};

export const updateSettings = async (settings: ISetting[]) => {
	const result = await makeAPIRequest("/api/settings", "PUT", {settings});

	if (result.status !== 200) {
		throw new Error(result.message);
	}
};

export const createPeer = async (peer: IPeer) => {
	const result = await makeAPIRequest("/api/peers", "POST", {peer});

	if (result.status !== 201) {
		throw new Error(result.message);
	} else {
		return result.peer;
	}
};

export const deletePeer = async (id: number) => {
	const result = await makeAPIRequest("/api/peers", "DELETE", {id});

	if (result.status !== 200) {
		throw new Error(result.message);
	} else {
		return id;
	}
};

export const updatePeer = async (peer: IPeer) => {
	const result = await makeAPIRequest("/api/peers", "PUT", {peer});

	if (result.status !== 200) {
		throw new Error(result.message);
	}
};

// THIS IS VERY HACKY!
export const downloadPeerConfig = async (id: number, deviceName: string) => {
	try {
		const result = await fetch(`/api/peers/download/${id}`, {
			method: "GET",
		});

		// 2. Create blob link to download
		const url = window.URL.createObjectURL(await result.blob());
		const link = document.createElement("a");
		link.href = url;
		link.setAttribute("download", `${deviceName}.conf`);

		// 3. Append to html page
		document.body.appendChild(link);

		// 4. Force download
		link.click();

		// 5. Clean up and remove the link
		link.parentNode.removeChild(link);
	} catch (err) {
		console.error(err);
	}
};

export const getLogs = async () => {
	const result = await makeAPIRequest(`/api/logs`, "GET", null);

	if (result.status !== 200) {
		throw new Error(result.message);
	}

	return result.logs;
};
