// import webServer from "./modules/http";
import data from "./modules/data";
import "reflect-metadata";

import {generateKeyPair} from "./modules/sh";

const main = async () => {
	console.log("Hello! Initializing..");

	await data.init();
	// await webServer.init();
	try {
		const {public_key, private_key} = await generateKeyPair();
		console.log("public", public_key);
		console.log("private", private_key);
	} catch (e) {
		console.error(e);
	}
};

main().catch(err => {
	console.log("Something bad happened..", err);
	process.exit(1);
});
