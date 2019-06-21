const nunjucks = require("nunjucks");
const fs = require("fs");
const wgHelper = require("./wgHelper");

exports.saveServerConfig = (server_config, cb) => {
	fs.writeFile("server_config.json", JSON.stringify(server_config, null, 2), cb);
}

exports.loadServerConfig = (cb) => {
	fs.stat("server_config.json", (err, stats) => {
		if (err) {

			wgHelper.getNetworkAdapter((err, network_adapter) => {
				if (err) {
					console.log(err);
					network_adapter = "";
				}

				wgHelper.getNetworkIP((err, network_ip) => {
					if (err) {
						console.log(err);
						network_ip = "";
					}
					const defaultSettings = {
							users: [],
							public_key: "",
							ip_address: network_ip,
							virtual_ip_address: "10.13.37.1",
							cidr: "24",
							port: "58210",
							dns: "1.1.1.1",
							network_adapter: network_adapter,
							config_path: "/etc/wireguard/wg0.conf",
							allowed_ips: ["0.0.0.0/0"],
							peers: []
						};

					fs.writeFile("server_config.json", JSON.stringify(defaultSettings, null, 2), (err) => {
						if (err) {
							cb(err);
							return;
						}

						cb(null, defaultSettings);
					});
					return;
				});

			});



		}

		fs.readFile("server_config.json", (err, buffer) => {
			if (err) {
				cb(err);
				return;
			}

			let parsed;

			try {
				parsed = JSON.parse(buffer.toString());
			} catch (err) {
				cb(err);
				return;
			}

			cb(null, parsed);
		});
	});
}

exports.saveWireguardConfig = (state, cb) => {
	const config = nunjucks.render("templates/config_server.njk", {
		virtual_ip_address: state.server_config.virtual_ip_address,
		cidr: state.server_config.cidr,
		private_key: state.server_config.private_key,
		port: state.server_config.port,
		network_adapter: state.server_config.network_adapter,
		peers: state.server_config.peers
	});

	console.log(state.server_config.config_path);
	fs.writeFile(state.server_config.config_path, config, (err) => {
		if (err) {
			cb(err);
			return;
		}

		cb(null);
	})
}
