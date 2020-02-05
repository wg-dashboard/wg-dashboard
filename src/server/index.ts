import webServer from "./modules/http";
import data from "./modules/data";
import "reflect-metadata";

const main = async () => {
	console.log("Hello! Initializing webserver..");

	await webServer.init();
	await data.init();
};

main().catch(err => {
	console.log("Something bad happened..", err);
	process.exit(1);
});
