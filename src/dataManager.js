const nunjucks = require("nunjucks");
const fs = require("fs");

exports.saveServerConfig = (server_config, cb) => {
	fs.writeFile("server_config.json", JSON.stringify(server_config, null, 2), cb);
}

exports.loadServerConfig = (cb) => {
	fs.readFile("server_config.json", (err, buffer) => {
		if (err) {
			fs.stat("server_config.json", (err, stats) => {
				if (err) {
					const defaultSettings = {
							dashboard_users: [],
							dashboard_passwords: [],
							public_key: "",
							ip_address: "",
							virtual_ip_address: "",
							cidr: "",
							port: "",
							dns: "",
							network_adapter: "",
							allowed_ips: ["0.0.0.0/0"],
							peers: []
						};

					fs.writeFile("server_config.json", JSON.stringify(defaultSettings, null, 2), (err) => {
						if (err) {
							cb(err);
							return;
						}

						cb();
					});
				}
			});
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

	fs.writeFile("./wireguard/wg0.conf", config, (err) => {
		if (err) {
			cb(err);
			return;
		}

		cb(null);
	})
}
