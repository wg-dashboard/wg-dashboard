import convict from "convict";

const config = convict({
	port: {
		doc: "Specifies the port for the webserver",
		format: "port",
		env: "PORT",
		default: 3000,
	},
});

config.validate({allowed: "strict"});

export default config;
