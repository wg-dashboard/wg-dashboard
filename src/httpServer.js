const express = require("express");
const morgan = require("morgan");
const nunjucks = require("nunjucks");

const dataManager = require("./dataManager");

exports.initServer = (state, cb) => {
	const app = express();
	app.use(morgan("dev"));
	app.use("/static", express.static("static"));

	app.use(express.json());

	nunjucks.configure(__dirname + "/views", {
		autoescape: true,
		watch: false,
		noCache: true,
		express: app
	});

	app.get("/login", (req, res) => { // main screen
		res.render("login.njk", {});
	});

	app.get("/", (req, res) => {
		res.render("dashboard.njk", {
			ip_address: state.server_config.ip_address,
			cidr: state.server_config.cidr,
			port: state.server_config.port,
			private_key: state.server_config.private_key,
			network_adapter: state.server_config.network_adapter,
			clients: state.server_config.peers,
		});
	});

	app.post("/api/peer", (req, res) => {
		const ids = state.server_config.peers.map((el) => {
			return parseInt(el.id, 10);
		});
		const id = Math.max(...ids) + 1;

		state.server_config.peers.push({
			id,
			device: "",
			allowed_ips: "",
			public_key: "",
			active: true,
		})

		dataManager.saveServerConfig(state.server_config, (err) => {
			if (err) {
				console.error("POST /api/peer COULD_NOT_SAVE_SERVER_CONFIG", err);
				res.status(500).send({
					msg: "COULD_NOT_SAVE_SERVER_CONFIG",
				});
				return;
			}

			res.send({
				msg: "ok",
				id,
			});
		});
	});

	app.put("/api/peer/:id", (req, res) => {
		const id = req.params.id;

		if (!id) {
			res.sendStatus(400);
			return;
		}

		const item = state.server_config.peers.find(el => parseInt(el.id, 10) === parseInt(id, 10));

		if (!item) {
			res.sendStatus(404);
			return;
		}

		item.device = req.body.device;
		item.allowed_ips = req.body.allowed_ips;
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
				msg: "ok",
			});
		});
	});

	app.delete("/api/peer/:id", (req, res) => {
		const id = req.params.id;

		if (!id) {
			res.sendStatus(400);
			return;
		}

		const itemIndex = state.server_config.peers.findIndex(el => parseInt(el.id, 10) === parseInt(id, 10));

		if (itemIndex === -1) {
			res.sendStatus(404);
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

			res.status(201).send({
				msg: "ok",
			});
		});
	});

	app.put("/api/server_settings/:id", (req, res) => {
		const id = req.params.id;

		if (!id) {
			res.sendStatus(400);
			return;
		}

		const data = req.body.data;

		if (!data) {
			// TODO: replace sendStatus with json sending functions
			// res.sendStatus(400);
			res.status(400).send({
				msg: "ERROR_INPUT_MISSING",
				missing: "data",
			});
			return;
		}

		if (!((state.server_config[id] || state.server_config[id] === ""))) {
			res.sendStatus(404);
			return;
		}

		state.server_config[id] = data;

		dataManager.saveServerConfig(state.server_config, (err) => {
			if (err) {
				console.error("PUT /api/server_settings COULD_NOT_SAVE_SERVER_CONFIG", err);
				res.status(500).send({
					msg: "COULD_NOT_SAVE_SERVER_CONFIG",
				});
				return;
			}

			res.status(201).send({
				msg: "ok",
			});
		});
	});

	app.get("/api/download/:id", (req, res) => {
		const id = req.params.id;

		if (!id) {
			res.sendStatus(400);
			return;
		}

		const item = state.server_config.peers.find(el => parseInt(el.id, 10) === parseInt(id, 10));

		if (!item) {
			res.sendStatus(404);
			return;
		}

		nunjucks.render("templates/config_client.njk", {
			server_public_key: state.server_config.public_key,
			server_port: state.server_config.port,
			allowed_ips: item.allowed_ips,
			ip_address: state.server_config.ip_address,
			server_endpoint: state.server_config.ip_address,
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

	app.listen(state.config.port, cb);
}
