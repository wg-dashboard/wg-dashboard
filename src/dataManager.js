const nunjucks = require("nunjucks");
const fs = require("fs");
const wgHelper = require("./wgHelper");

exports.saveServerConfig = (server_config, cb) => {
	fs.writeFile("server_config.json", JSON.stringify(server_config, null, 2), cb);
}

exports.loadServerConfig = (cb) => {
	fs.stat("server_config.json", (err) => {
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
							tls_servername: "tls.cloudflare-dns.com"
					};

					this.saveServerConfig(defaultSettings, (err) => {
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

		fs.readFile("server_config.json", (err, buffer) => {
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
					this.saveServerConfig(parsed, (err) => {
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
}

exports.saveDNSConfig = (state, cb) => {

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

	// write main config
	fs.writeFile(state.server_config.config_path, config, (err) => {
		if (err) {
			cb(err);
			return;
		}

		const coredns_config = nunjucks.render("templates/coredns_corefile.njk", {
			dns_over_tls: state.server_config.dns_over_tls,
			ip: state.server_config.dns,
			tls_servername: state.server_config.tls_servername
		});

		fs.writeFile("/etc/coredns/Corefile", coredns_config, (err) => {
			if (err) {
				cb(err);
				return;
			}

			cb(null);
		});
	});
}
