import convict from "convict";

const config = convict({
	port: {
		doc: "Specifies the port for the webserver",
		format: "port",
		env: "PORT",
		default: 3000,
	},

	sessionSecret: {
		doc: "Secret that is being used for sessions",
		format: String,
		env: "SESSIONSECRET",
		default: "mysecret",
	},
});

config.validate({allowed: "strict"});

export default config;
