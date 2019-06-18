const express = require("express");
const morgan = require("morgan");
const nunjucks = require("nunjucks");
const session = require("express-session");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");

const dataManager = require("./dataManager");
const wireguardHelper = require("./wgHelper");

exports.initServer = (state, cb) => {
	const app = express();
	app.use(morgan("dev"));
	app.use("/static", express.static("static"));

	app.use(express.json());

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

	app.get("/login", (req, res) => { // main screen
		if (state.server_config.dashboard_users.length === 0 && state.server_config.dashboard_passwords.length === 0) {
			res.redirect("/createuser");
		}

		res.render("login.njk");
	});

	app.get("/logout", (req, res) => {
		req.session.admin = false;
		res.redirect("/login");
	});

	app.get("/createuser", (req, res) => {
		res.render("setup_user.njk");
	})

	app.post("/api/createuser", bodyParser.urlencoded({ extended: false }), (req, res) => {
		if (req.body.username && req.body.password) {
			if (state.server_config.dashboard_users.length === 0 && state.server_config.dashboard_passwords.length === 0 || req.session.admin) {
				const saltRounds = 10;

				bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
					if (err) {
						res.status(500).send({
							msg: err
						});
						return;
					}

					state.server_config.dashboard_users.push(req.body.username);
					state.server_config.dashboard_passwords.push(hash);

					dataManager.saveServerConfig(state.server_config, (err) => {
						if (err) {
							res.status(500).send({
								msg: "COULD_NOT_SAVE_CONFIG"
							});
							return;
						}

						req.session.admin = true;
						res.redirect("/");
					});
				});
			} else {
				res.status(401).send({
					msg: "FIRST_ACCOUNT_ALREADY_EXISTS"
				});
			}
		}
	});

	app.post("/api/login", bodyParser.urlencoded({ extended: false }), (req, res) => {

		const userIndex = state.server_config.dashboard_users.findIndex(el => el === req.body.username);

		if (userIndex !== -1) {
			const pass = state.server_config.dashboard_passwords[userIndex];

			bcrypt.compare(req.body.password, pass, function(err, hashCorrect) {
				if (err) {
					res.status(500).send({
						msg: err
					});
					return;
				}

				if (hashCorrect) {
					req.session.admin = true;
					res.redirect("/");
				} else {
					res.redirect("/login");
				}
			});
		} else {
			res.redirect("/login");
		}
		/* if (req.body.username === state.server_config.dashboard_user && req.body.password === state.server_config.dashboard_password) {
			req.session.admin = true;

			res.redirect("/");
		} else {
			res.redirect("/login");
		} */
	});

	// Authentication and Authorization Middleware
	var auth = function(req, res, next) {
		if (req.session && req.session.admin) {
			return next();
		} else {
			if (state.server_config.dashboard_users.length === 0 && state.server_config.dashboard_passwords.length === 0) {
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
			public_key: state.server_config.public_key,
			network_adapter: state.server_config.network_adapter,
			clients: state.server_config.peers,
		});
	});

	app.post("/api/peer", (req, res) => {
		const ids = state.server_config.peers.map((el) => {
			return parseInt(el.id, 10);
		});
		const id = Math.max(...ids) + 1;

		wireguardHelper.generateKeyPair((err, data) => {
			if (err) {
				console.error(err);
				res.status(500).send({
					msg: "COULD_NOT_CREATE_KEYPAIR",
				});
			}

			state.server_config.peers.push({
				id,
				device: "",
				allowed_ips: "",
				virtual_ip: "",
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

		item.device = req.body.device;
		item.allowed_ips = req.body.allowed_ips.replace(/ /g, "").split(",");
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

	app.put("/api/server_settings/save", (req, res) => {
		// const id = req.params.id;

		// if (!id) {
		// 	res.sendStatus(400);
		// 	return;
		// }
		// const data = req.body.data;

		if (!req.body) {
			// TODO: replace sendStatus with json sending functions
			// res.sendStatus(400);
			res.status(400).send({
				msg: "ERROR_INPUT_MISSING",
				missing: "data",
			});
			return;
		}

		// if (!((state.server_config[id] || state.server_config[id] === ""))) {
		// 	res.sendStatus(404);
		// 	return;
		// }

		state.server_config.ip_address = req.body.ip_address;
		state.server_config.virtual_ip_address = req.body.virtual_ip_address;
		state.server_config.port = req.body.port;
		state.server_config.cidr = req.body.cidr;
		state.server_config.network_adapter = req.body.network_adapter;

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
			allowed_ips: item.allowed_ips,
			client_ip_address: item.virtual_ip,
			cidr: state.server_config.cidr,
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

			res.set("Content-disposition", "attachment; filename=client_config_" + id + ".conf");
			res.set("Content-Type", "text/plain");
			res.send(renderedConfig);
		});
	});

	app.post("/api/saveconfig", (req, res) => {
		dataManager.saveWireguardConfig(state, (err) => {
			if (err) {
				res.status(500).send({
					msg: "COULD_NOT_SAVE_WIREGUARD_CONFIG",
				});
				return;
			}

			res.status(201).send({
				msg: "OK",
			});
		});
	});

	app.post("/api/restartwg", (req, res) => {
		wireguardHelper.restartWireguard((err) => {
			if (err) {
				res.status(500).send({
					msg: "COULD_NOT_RESTART_WIREGUARD",
				});
				return;
			}

			res.status(201).send({
				msg: "OK",
			});
		});
	});

	app.listen(state.config.port, cb);
}
