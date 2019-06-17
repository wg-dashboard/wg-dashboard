const dataManager = require("./dataManager");
const httpServer = require("./httpServer");

function main() {
	const state = {
		config: {
			port: process.env.PORT || 3000,
			outPath: process.env.OUT_PATH || "wireguard/wg0.conf",
		},
		server_config: null,
	};

	dataManager.loadServerConfig((err, server_config) => {
		if (err) {
			console.error("could not load server config", err);
			return;
		}

		state.server_config = server_config;

		httpServer.initServer(state, () => {
			console.log(`Listening on port ${state.config.port}!`);
		});
	});
}

main();
