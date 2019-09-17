const dataManager = require("./dataManager");
const child_process = require("child_process");

exports.checkServerKeys = (state, cb) => {
	if (!state.server_config.private_key || !state.server_config.public_key) {
		child_process.exec("wg genkey", (err, stdout, stderr) => {
			if (err || stderr) {
				console.error(err);
				console.error("Wireguard is possibly not installed?");
				process.exit(1);
			}

			const private_key = stdout.replace(/\n/, "");

			const wgchild = child_process.spawn("wg", ["pubkey"]);

			let pubkey;
			wgchild.stdout.on("data", data => {
				pubkey = data.toString();
			});

			wgchild.stderr.on("data", data => {
				console.log(data.toString());
			});

			wgchild.on("close", code => {
				if (code !== 0) {
					console.error(`wg pubkey process exited with code ${code}`);
					process.exit(1);
				}

				const public_key = pubkey.replace(/\n/, "");

				state.server_config.public_key = public_key;
				state.server_config.private_key = private_key;

				dataManager.saveServerConfig(state.server_config, err => {
					if (err) {
						console.error("could not save private and public keys");
						process.exit(1);
						return;
					}

					cb(state);
				});
				// do stuff
			});

			wgchild.stdin.end(private_key);
		});
	} else {
		cb(state);
	}
};

exports.generateKeyPair = cb => {
	child_process.exec("wg genkey", (err, stdout, stderr) => {
		if (err || stderr) {
			cb(err);
			return;
		}

		const private_key = stdout.replace(/\n/, "");

		child_process.exec(
			`echo "${private_key}" | wg pubkey`,
			(err, stdout, stderr) => {
				if (err || stderr) {
					cb(err);
					return;
				}

				const public_key = stdout.replace(/\n/, "");

				cb(null, {
					private_key: private_key,
					public_key: public_key,
				});
			}
		);
	});
};

exports.stopWireguard = cb => {
	child_process.exec("systemctl stop wg-quick@wg0", (err, stdout, stderr) => {
		if (err || stderr) {
			cb(err);
			return;
		}

		cb();
	});
};

exports.startWireguard = cb => {
	child_process.exec(
		"systemctl start wg-quick@wg0",
		(err, stdout, stderr) => {
			if (err || stderr) {
				cb(err);
				return;
			}

			cb();
		}
	);
};

exports.wireguardStatus = cb => {
	child_process.exec(
		"journalctl -u wg-quick@wg0.service -n 100",
		(err, stdout, stderr) => {
			if (err || stderr) {
				cb(err);
				return;
			}

			cb(null, stdout);
		}
	);
};

exports.getNetworkAdapter = cb => {
	child_process.exec(
		"ip route | grep default | cut -d ' ' -f 5",
		(err, stdout, stderr) => {
			if (err || stderr) {
				cb(err);
				return;
			}

			cb(null, stdout.replace(/\n/, ""));
		}
	);
};

exports.getNetworkIP = cb => {
	child_process.exec(
		"ifconfig eth0 | grep inet | head -n 1 | xargs | cut -d ' ' -f 2",
		(err, stdout, stderr) => {
			if (err || stderr) {
				cb(err);
				return;
			}

			cb(null, stdout.replace(/\n/, ""));
		}
	);
};

exports.addPeer = (peer, cb) => {
	child_process.exec(
		`wg set wg0 peer ${peer.public_key} allowed-ips ${peer.allowed_ips}/32`,
		(err, stdout, stderr) => {
			if (err || stderr) {
				cb(err);
				return;
			}

			cb(null);
		}
	);
};

exports.deletePeer = (peer, cb) => {
	child_process.exec(
		`wg set wg0 peer ${peer.public_key} remove`,
		(err, stdout, stderr) => {
			if (err || stderr) {
				cb(err);
				return;
			}

			cb(null);
		}
	);
};

exports.makeDashboardPrivate = (state, cb) => {
	child_process.exec(
		`ufw delete allow 3000 ; ufw deny in on ${state.server_config
			.network_adapter || "eth0"} to any port 3000`,
		(err, stdout, stderr) => {
			if (err || stderr) {
				cb(err);
				return;
			}

			child_process.exec(
				"ufw allow in on wg0 to any port 3000",
				(err, stdout, stderr) => {
					if (err || stderr) {
						cb(err);
						return;
					}

					cb(null, stdout.replace(/\n/, ""));
				}
			);
		}
	);
};

exports.makeDashboardPublic = (state, cb) => {
	child_process.exec(
		`ufw allow in on ${state.server_config.network_adapter ||
			"eth0"} to any port 3000`,
		(err, stdout, stderr) => {
			if (err || stderr) {
				cb(err);
				return;
			}

			cb(null, stdout.replace(/\n/, ""));
		}
	);
};

exports.restartCoreDNS = cb => {
	child_process.exec(`systemctl restart coredns`, (err, stdout, stderr) => {
		if (err || stderr) {
			cb(err);
			return;
		}

		cb(null);
	});
};

exports.enableUFW = (port, cb) => {
	child_process.exec(`ufw allow ${port}`, (err, stdout, stderr) => {
		if (err || stderr) {
			cb(err);
			return;
		}

		cb(null);
	});
};

exports.disableUFW = (port, cb) => {
	child_process.exec(`ufw delete allow ${port}`, (err, stdout, stderr) => {
		if (err || stderr) {
			cb(err);
			return;
		}

		cb(null);
	});
};
