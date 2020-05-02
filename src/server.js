const dataManager = require("./dataManager");
const httpServer = require("./httpServer");
const wireguardHelper = require("./wgHelper");
const Stats = require('./Stats.js')


function main() {
	dataManager.loadServerConfig((err, server_config) => {
		if (err) {
			console.error("could not load server config", err);
			return;
		}

		const state = {
			config: {
				port: server_config.webserver_port || 3000,
				devLogs: false
			},
			server_config: null
		};

		state.server_config = server_config;

		wireguardHelper.checkServerKeys(state, state => {
			httpServer.initServer(state, () => {
				console.log(
					`WireGuard-Dashboard listening on port ${
						state.config.port
					}!`
				);
			});
		});

		if(server_config.stats_interval > 0) {
			setInterval(function () {
				let stats = new Stats();
			}, server_config.stats_interval);
		}
	});
}

main();
