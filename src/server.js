const dataManager = require("./dataManager");
const httpServer = require("./httpServer");
const wireguardHelper = require("./wgHelper");

function main() {
	const state = {
		config: {
			port: process.env.PORT || 3000,
			devLogs: false,
		},
		server_config: null,
	};

	dataManager.loadServerConfig((err, server_config) => {
		if (err) {
			console.error("could not load server config", err);
			return;
		}

		state.server_config = server_config;

		wireguardHelper.checkServerKeys(state, (state) => {
			httpServer.initServer(state, () => {
				console.log(`WireGuard-Dashboard listening on port ${state.config.port}!`);
			});
		});
	});
}

main();
