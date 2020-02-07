import webServer from "./modules/http";
import data from "./modules/data";
import "reflect-metadata";

const main = async () => {
	console.log("Hello! Initializing..");

	await data.init();
	await webServer.init();
};

main().catch(err => {
	console.log("Something bad happened..", err);
	process.exit(1);
});
