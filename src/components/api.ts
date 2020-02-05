import {IUser} from "../server/interfaces";

const makeAPIRequest = async (url: string, data: any) => {
	const request = await fetch(url, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(data),
	});

	const resp = await request.json();

	if (resp.status === 200) {
		alert(resp.message);
	} else {
		alert("ERROR: " + resp.message);
	}

	return resp;
};

export const loginRegisterUser = async (data: IUser) => {
	console.log(JSON.stringify(data));
	const result = await makeAPIRequest("/api/login", data);
	console.log(result);
};
