const nunjucks = require("nunjucks");
const fs = require("fs");
const wgHelper = require("./wgHelper");

/**
 * Save Dashboard and WireGuard configuration to disk
 */
exports.saveBothConfigs = (server_config, cb) => {
	exports.saveServerConfig(server_config, err => {
		if (err) {
			cb("COULD_NOT_SAVE_SERVER_CONFIG");
			return;
		}

		exports.saveWireguardConfig(server_config, err => {
			if (err) {
				cb("COULD_NOT_SAVE_WIREGUARD_CONFIG");
				return;
			}

			cb();
		});
	});
};

exports.saveServerConfig = (server_config, cb) => {
	fs.writeFile(
		"./server_config.json",
		JSON.stringify(server_config, null, 2),
		{mode: 0o600},
		cb
	);
};

exports.loadServerConfig = cb => {
	fs.stat("./server_config.json", err => {
		if (err) {
			wgHelper.getNetworkAdapter((err, network_adapter) => {
				if (err) {
					console.log(err);
					network_adapter = "eth0";
				}

				wgHelper.getNetworkIP((err, network_ip) => {
					if (err) {
						console.log(err);
						network_ip = "";
					}

					const defaultSettings = {
						webserver_port: 3000,
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
						peers: [],
						private_traffic: false,
						dns_over_tls: true,
						tls_servername: "tls.cloudflare-dns.com",
					};

					this.saveServerConfig(defaultSettings, err => {
						if (err) {
							cb(err);
							return;
						}

						cb(null, defaultSettings);
					});
				});
			});

			return;
		}

		fs.readFile("./server_config.json", (err, buffer) => {
			if (err) {
				cb(err);
				return;
			}

			let parsed;

			try {
				parsed = JSON.parse(buffer.toString());

				let needSave = false;
				for (let i = 0; i < parsed.peers.length; i++) {
					const item = parsed.peers[i];

					// check if item has virtual ip => if not, delete item
					if (!item.virtual_ip) {
						parsed.peers.splice(i, 1);
						needSave = true;
					}
				}

				if (needSave) {
					this.saveServerConfig(parsed, err => {
						if (err) {
							cb(err);
							return;
						}

						cb(null, parsed);
					});
				} else {
					cb(null, parsed);
				}
			} catch (err) {
				cb(err);
				return;
			}
		});
	});
};

exports.saveWireguardConfig = (server_config, cb) => {
	const config = nunjucks.render("templates/config_server.njk", {
		virtual_ip_address: server_config.virtual_ip_address,
		cidr: server_config.cidr,
		private_key: server_config.private_key,
		port: server_config.port,
		network_adapter: server_config.network_adapter,
		peers: server_config.peers,
	});

	// write main config
	fs.writeFile(server_config.config_path, config, {mode: 0o600}, err => {
		if (err) {
			cb(err);
			return;
		}

		const coredns_config = nunjucks.render(
			"templates/coredns_corefile.njk",
			{
				dns_over_tls: server_config.dns_over_tls,
				ip: server_config.dns,
				tls_servername: server_config.tls_servername,
			}
		);

		// write new coredns config
		fs.writeFile("/etc/coredns/Corefile", coredns_config, err => {
			if (err) {
				cb(err);
				return;
			}

			// restart coredns
			wgHelper.restartCoreDNS(err => {
				if (err) {
					cb(err);
					return;
				}

				cb(null);
			});
		});
	});
};
