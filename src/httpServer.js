const express = require("express");
const morgan = require("morgan");
const nunjucks = require("nunjucks");
const session = require("express-session");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const rateLimit = require("express-rate-limit");
const cidr = require("node-cidr");

const dataManager = require("./dataManager");
const wireguardHelper = require("./wgHelper");

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100 // limit each IP to 100 requests per windowMs
});

exports.initServer = (state, cb) => {
	const app = express();
	state.config.devLogs ? app.use(morgan("dev")) : "";
	app.use("/static", express.static("static"));

	app.use(express.json());
	app.use(limiter);

	const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnoprqstuvwxyz0123456789";
	let session_secret = "";
	for (let i = 0; i < 32; i++) {
		session_secret += chars[Math.floor(Math.random() * chars.length)];
	}
	session_secret = session_secret.slice(7, 12) + "-" + session_secret.slice(18, 23) + "-" + session_secret.slice(26, 31);

	app.use(session({
		secret: session_secret,
		resave: true,
		saveUninitialized: true
	}));

	nunjucks.configure(__dirname + "/views", {
		autoescape: true,
		watch: false,
		noCache: true,
		express: app
	});

	app.get("/login", (req, res) => {
		if (state.server_config.users.length === 0) {
			res.redirect("/createuser");
			return;
		}

		res.render("login.njk");
	});

	app.get("/logout", (req, res) => {
		req.session.admin = false;
		res.redirect("/login");
	});

	app.get("/createuser", (req, res) => {
		const firstAccount = state.server_config.users.length === 0 ? true : false;
		res.render("setup_user.njk", {
			firstAccount: firstAccount,
		});
	});

	app.post("/api/createuser", bodyParser.urlencoded({ extended: false }), (req, res) => {
		if (req.body.username && req.body.password) {
			if (req.body.password === req.body.password_confirm) {
				if (state.server_config.users.length === 0 || req.session.admin) {
					const saltRounds = 10;

					bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
						if (err) {
							res.status(500).send({
								msg: err
							});
							return;
						}

						state.server_config.users.push({
							id: state.server_config.users.length + 1,
							username: req.body.username,
							password: hash,
						});

						dataManager.saveServerConfig(state.server_config, (err) => {
							if (err) {
								res.status(500).send({
									msg: "COULD_NOT_SAVE_CONFIG"
								});
								return;
							}

							req.session.admin = true;
							res.status(200).send({
								msg: "OK",
							});
						});
					});
				} else {
					res.status(401).send({
						msg: "FIRST_ACCOUNT_ALREADY_EXISTS"
					});
				}
			} else {
				res.status(500).send({
					msg: "PASSWORDS_DO_NOT_MATCH"
				});
			}
		} else {
			res.status(500).send({
				msg: "USERNAME_AND_OR_PASSWORD_MISSING"
			});
		}
	});

	app.post("/api/login", bodyParser.urlencoded({ extended: false }), (req, res) => {
		const userItem = state.server_config.users.find(el => el.username === req.body.username);

		if (userItem) {
			const pass = userItem.password;

			bcrypt.compare(req.body.password, pass, function(err, hashCorrect) {
				if (err) {
					res.status(500).send({
						msg: err
					});
					return;
				}

				if (hashCorrect) {
					req.session.admin = true;
					res.status(200).send({
						msg: "OK"
					});
				} else {
					res.status(404).send({
						msg: "USERNAME_OR_PASSWORD_WRONG_OR_NOT_FOUND"
					});
				}
			});
		} else {
			res.status(404).send({
				msg: "USERNAME_OR_PASSWORD_WRONG_OR_NOT_FOUND"
			});
		}
		/* if (req.body.username === state.server_config.dashboard_user && req.body.password === state.server_config.dashboard_password) {
			req.session.admin = true;

			res.redirect("/");
		} else {
			res.redirect("/login");
		} */
	});

	// Authentication and Authorization Middleware
	let auth = function(req, res, next) {
		if (req.session && req.session.admin) {
			return next();
		} else {
			if (state.server_config.users.length === 0) {
				return res.redirect("/createuser");
			}
			return res.redirect("/login");
		}
	};

	app.use(auth);

	app.get("/", (req, res) => {
		res.render("dashboard.njk", {
			ip_address: state.server_config.ip_address,
			virtual_ip_address: state.server_config.virtual_ip_address,
			cidr: state.server_config.cidr,
			port: state.server_config.port,
			dns: state.server_config.dns,
			allowed_ips: state.server_config.allowed_ips,
			public_key: state.server_config.public_key,
			network_adapter: state.server_config.network_adapter || "eth0",
			clients: state.server_config.peers,
			users: state.server_config.users,
			config_path: state.server_config.config_path,
			private_traffic: state.server_config.private_traffic,
		});
	});

	app.post("/api/peer", (req, res) => {
		const ids = state.server_config.peers.map((el) => {
			return parseInt(el.id, 10);
		});
		const id = parseInt(Math.max(...ids) + 1, 10) || 0;

		wireguardHelper.generateKeyPair((err, data) => {
			if (err) {
				console.error(err);
				res.status(500).send({
					msg: "COULD_NOT_CREATE_KEYPAIR",
				});
			}

			let virtual_ip = "";

			if (state.server_config.virtual_ip_address) {
				const ipList = cidr.cidr.ips(`${state.server_config.virtual_ip_address}/${state.server_config.cidr}`);

				// delete the ip of the server
				const mainIndex = ipList.findIndex(el => el === state.server_config.virtual_ip_address);
				ipList.splice(mainIndex, 1);

				// delete the ips of all available clients
				for (let i = 0; i < state.server_config.peers.length; i++) {
					const index = ipList.findIndex(el => el === state.server_config.peers[i].virtual_ip);
					ipList.splice(index, 1);
				}

				// check if there is an free ip available
				if (ipList[0]) {
					virtual_ip = ipList[0];
				}
			}

			state.server_config.peers.push({
				id,
				device: "",
				virtual_ip: virtual_ip,
				public_key: data.public_key,
				private_key: data.private_key,
				active: true,
			});

			dataManager.saveServerConfig(state.server_config, (err) => {
				if (err) {
					console.error("POST /api/peer COULD_NOT_SAVE_SERVER_CONFIG", err);
					res.status(500).send({
						msg: "COULD_NOT_SAVE_SERVER_CONFIG",
					});
					return;
				}

				res.status(201).send({
					msg: "OK",
					id,
					public_key: data.public_key,
					ip: virtual_ip,
				});
			});
		});
	});

	app.put("/api/peer/:id", (req, res) => {
		const id = req.params.id;

		if (!id) {
			res.status(404).send({
				msg: "NO_ID_PROVIDED_OR_FOUND",
			});
			return;
		}

		const item = state.server_config.peers.find(el => parseInt(el.id, 10) === parseInt(id, 10));

		if (!item) {
			res.status(404).send({
				msg: "PEER_NOT_FOUND",
			});
			return;
		}

		const ipCheck = new RegExp(/^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/);

		const ipValid = ipCheck.test(req.body.virtual_ip);
		if (!ipValid) {
			res.status(500).send({
				msg: "PEER_VIRTUAL_IP_INVALID",
			});
			return;
		}

		item.device = req.body.device;
		item.virtual_ip = req.body.virtual_ip;
		item.public_key = req.body.public_key;
		item.active = req.body.active;

		dataManager.saveServerConfig(state.server_config, (err) => {
			if (err) {
				console.error("PUT /api/peer/:id COULD_NOT_SAVE_SERVER_CONFIG", err);
				res.status(500).send({
					msg: "COULD_NOT_SAVE_SERVER_CONFIG",
				});
				return;
			}

			res.send({
				msg: "OK",
			});
		});
	});

	app.delete("/api/peer/:id", (req, res) => {
		const id = req.params.id;

		if (!id) {
			res.status(404).send({
				msg: "NO_ID_PROVIDED_OR_FOUND",
			});
			return;
		}

		const itemIndex = state.server_config.peers.findIndex(el => parseInt(el.id, 10) === parseInt(id, 10));

		if (itemIndex === -1) {
			res.status(404).send({
				msg: "PEER_NOT_FOUND",
			});
			return;
		}

		state.server_config.peers.splice(itemIndex, 1);

		dataManager.saveServerConfig(state.server_config, (err) => {
			if (err) {
				console.error("DELETE /api/peer/:id COULD_NOT_SAVE_SERVER_CONFIG", err);
				res.status(500).send({
					msg: "COULD_NOT_SAVE_SERVER_CONFIG",
				});
				return;
			}

			res.send({
				msg: "OK",
			});
		});
	});

	app.put("/api/server_settings/save/allowed_ips", (req, res) => {
		if (!req.body) {
			res.status(400).send({
				msg: "ERROR_INPUT_MISSING",
				missing: "data",
			});
			return;
		}

		let validIPs = true;
		const _allowedIPs = req.body.allowed_ips.replace(/ /g, "").split(",");
		_allowedIPs.forEach((e) => {
			const match = /^([0-9]{1,3}\.){3}[0-9]{1,3}(\/([0-9]|[1-2][0-9]|3[0-2]))$/.test(e);
			if (!match) {
				validIPs = false;
			}
		});

		if (!validIPs) {
			res.status(500).send({
				msg: "INVALID_IP_SETUP",
			});
			return;
		}

		state.server_config.allowed_ips = _allowedIPs;

		dataManager.saveServerConfig(state.server_config, (err) => {
			if (err) {
				res.status(500).send({
					msg: "COULD_NOT_SAVE_SERVER_CONFIG",
				});
				return;
			}

			res.send({
				msg: "OK",
			});
		});
	});

	app.put("/api/server_settings/save", (req, res) => {
		if (!req.body) {
			res.status(400).send({
				msg: "ERROR_INPUT_MISSING",
				missing: "data",
			});
			return;
		}

		const ipCheck = new RegExp(/^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/);
		const portCheck = new RegExp(/^()([1-9]|[1-5]?[0-9]{2,4}|6[1-4][0-9]{3}|65[1-4][0-9]{2}|655[1-2][0-9]|6553[1-5])$/);

		const dnsValid = ipCheck.test(req.body.dns);
		if (!dnsValid) {
			res.status(500).send({
				msg: "DNS_IP_INVALID",
			});
			return;
		}

		const virtualIPValid = ipCheck.test(req.body.virtual_ip_address);
		if (!virtualIPValid) {
			res.status(500).send({
				msg: "VIRTUAL_IP_INVALID",
			});
			return;
		}

		const portValid = portCheck.test(req.body.port);
		if (!portValid) {
			res.status(500).send({
				msg: "PORT_INVALID",
			});
			return;
		}

		state.server_config.ip_address = req.body.ip_address;
		state.server_config.virtual_ip_address = req.body.virtual_ip_address;
		state.server_config.dns = req.body.dns;
		state.server_config.port = req.body.port;
		state.server_config.cidr = req.body.cidr;
		state.server_config.network_adapter = req.body.network_adapter;
		state.server_config.config_path = req.body.config_path;

		dataManager.saveServerConfig(state.server_config, (err) => {
			if (err) {
				console.error("PUT /api/server_settings COULD_NOT_SAVE_SERVER_CONFIG", err);
				res.status(500).send({
					msg: "COULD_NOT_SAVE_SERVER_CONFIG",
				});
				return;
			}

			res.send({
				msg: "OK",
			});
		});
	});

	app.get("/api/download/:id", (req, res) => {
		const id = req.params.id;

		if (!id) {
			res.status(400).send({
				msg: "NO_ID_PROVIDED_OR_FOUND",
			});
			return;
		}

		const item = state.server_config.peers.find(el => parseInt(el.id, 10) === parseInt(id, 10));

		if (!item) {
			res.status(404).send({
				msg: "PEER_NOT_FOUND",
			});
			return;
		}

		nunjucks.render("templates/config_client.njk", {
			server_public_key: state.server_config.public_key,
			server_port: state.server_config.port,
			allowed_ips: state.server_config.allowed_ips,
			client_ip_address: item.virtual_ip,
			cidr: state.server_config.cidr,
			dns: state.server_config.dns,
			client_private_key: item.private_key,
			server_endpoint: state.server_config.ip_address,
			server_virtual_ip: state.server_config.virtual_ip_address,
		}, (err, renderedConfig) => {
			if (err) {
				console.error("/api/download/:id", id, item, err);
				res.status(500).send({
					err: "COULD_NOT_RENDER_CLIENT_CONFIG",
				});
				return;
			}

			const fileSuffix = item.device ? item.device : id;
			res.set("Content-disposition", "attachment; filename=client_config_" + fileSuffix + ".conf");
			res.set("Content-Type", "text/plain");
			res.send(renderedConfig);
		});
	});

	app.post("/api/saveandrestart", (req, res) => {
		wireguardHelper.stopWireguard((err) => {
			if (err) {
				res.status(500).send({
					msg: "COULD_NOT_STOP_WIREGUARD",
				});
				return;
			}

			dataManager.saveWireguardConfig(state, (err) => {
				if (err) {
					res.status(500).send({
						msg: "COULD_NOT_SAVE_WIREGUARD_CONFIG",
					});
					return;
				}

				wireguardHelper.startWireguard((err) => {
					if (err) {
						res.status(500).send({
							msg: "COULD_NOT_START_WIREGUARD",
						});
						return;
					}

					res.status(201).send({
						msg: "OK",
					});
				});
			});
		});
	});

	app.post("/api/getwireguardstatus", (req, res) => {
		wireguardHelper.wireguardStatus((err, stdout) => {
			if (err) {
				res.status(500).send({
					msg: err.toString(),
				});
				return;
			}

			res.status(201).send({
				msg: "OK",
				data: stdout,
			});
		});
	});

	app.post("/api/refreshserverkeys", (req, res) => {
		wireguardHelper.generateKeyPair((err, newPair) => {
			if (err) {
				res.status(500).send({
					msg: err.toString(),
				});
				return;
			}

			state.server_config.public_key = newPair.public_key;
			state.server_config.private_key = newPair.private_key;

			dataManager.saveServerConfig(state.server_config, (err) => {
				if (err) {
					res.status(500).send({
						msg: err
					});
					return;
				}

				res.status(200).send({
					msg: "OK",
					public_key: newPair.public_key,
				});
			});
		});
	});

	app.put("/api/user/edit/:id", (req, res) => {
		const id = req.params.id;

		if (!id) {
			res.status(400).send({
				msg: "NO_ID_PROVIDED_OR_FOUND",
			});
			return;
		}

		const userItem = state.server_config.users.find(el => parseInt(el.id, 10) === parseInt(id, 10));

		if (userItem) {
			const user = req.body.username;
			const pass = req.body.password;

			userItem.username = user;

			if (pass) {
				bcrypt.hash(pass, 10, (err, hash) => {
					if (err) {
						res.status(500).send({
							msg: err
						});
						return;
					}

					userItem.password = hash;

					dataManager.saveServerConfig(state.server_config, (err) => {
						if (err) {
							res.status(500).send({
								msg: err
							});
							return;
						}

						res.status(200).send({
							msg: "OK"
						});
					});
				});
			} else {
				dataManager.saveServerConfig(state.server_config, (err) => {
					if (err) {
						res.status(500).send({
							msg: err
						});
						return;
					}

					res.status(200).send({
						msg: "OK"
					});
				});
			}
		} else {
			res.status(404).send({
				msg: "USER_NOT_FOUND"
			});
		}
	});

	app.delete("/api/user/delete/:id", (req, res) => {
		const id = req.params.id;

		if (!id) {
			res.status(400).send({
				msg: "NO_ID_PROVIDED_OR_FOUND",
			});
			return;
		}

		const userItemIndex = state.server_config.users.findIndex(el => parseInt(el.id, 10) === parseInt(id, 10));

		if (userItemIndex !== -1) {
			if (state.server_config.users.length !== 1) {
				state.server_config.users.splice(userItemIndex, 1);

				dataManager.saveServerConfig(state.server_config, (err) => {
					if (err) {
						res.status(500).send({
							msg: err
						});
						return;
					}

					res.status(200).send({
						msg: "OK"
					});
				});
			} else {
				res.status(500).send({
					msg: "CANNOT_DELETE_LAST_USER"
				});
			}
		} else {
			res.status(404).send({
				msg: "USER_NOT_FOUND"
			});
		}
	});

	app.post("/api/switchtrafficmode", (req, res) => {
		if (state.server_config.private_traffic) {
			wireguardHelper.makeDashboardPublic(state, (err) => {
				if (err) {
					res.status(500).send({
						msg: err.toString()
					});
					return;
				}

				state.server_config.private_traffic = false;
				res.status(200).send({
					msg: "OK"
				});
			});
		} else {
			wireguardHelper.makeDashboardPrivate(state, (err) => {
				if (err) {
					res.status(500).send({
						msg: err.toString()
					});
					return;
				}

				state.server_config.private_traffic = true;
				res.status(200).send({
					msg: "OK"
				});
			});
		}
	});

	app.listen(state.config.port, "localhost", cb);
}
