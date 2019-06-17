const express = require("express");
const morgan = require("morgan");
const app = express();
const nunjucks = require("nunjucks");
const fs = require("fs");

const server_config = require("./server_config.json");

const config = {
	port: process.env.PORT || 3000,
	outPath: process.env.OUT_PATH || "wireguard/wg0.conf",
}

app.use(morgan("dev"));
app.use("/static", express.static("static"));

app.use(express.json());

const env = nunjucks.configure(
	__dirname + "/views", {
		autoescape: true,
		watch: false,
		noCache: true,
		express: app
});

app.get("/", (req, res) => { // main screen
	// console.log(req.query);
	res.render("index.njk", {});
});

app.get("/dashboard", (req, res) => {
	res.render("dashboard.njk", {
		ip_address: server_config.ip_address,
		cidr: server_config.cidr,
		port: server_config.port,
		private_key: server_config.private_key,
		network_adapter: server_config.network_adapter,
		clients: server_config.peers,
	});
});

app.post("/api/peer", (req, res) => {
	const ids = server_config.peers.map((el) => {
		return parseInt(el.id, 10);
	});
	const id = Math.max(...ids) + 1;

	server_config.peers.push({
		id,
		device: "",
		allowed_ips: "",
		public_key: "",
	})

	saveServerConfig();

	res.send({
		msg: "ok",
		id,
	});
});

app.put("/api/peer/:id", (req, res) => {
	const id = req.params.id;

	const item = server_config.peers.find(el => parseInt(el.id, 10) === parseInt(id, 10));

	if (item) {
		item.device = req.body.device;
		item.allowed_ips = req.body.allowed_ips,
		item.public_key = req.body.public_key,
		saveServerConfig();

		res.send({
			msg: "ok",
		});
	} else {
		res.sendStatus(500);
	}
});



app.delete("/api/peer/:id", (req, res) => {
	const id = req.params.id;

	const itemIndex = server_config.peers.findIndex(el => parseInt(el.id, 10) === parseInt(id, 10));

	if (itemIndex !== -1) {
		server_config.peers.splice(itemIndex, 1);
		saveServerConfig();

		res.sendStatus(200);
	} else {
		res.sendStatus(500);
	}
});

app.put("/api/server_settings/:id", (req, res) => {
	const id = req.params.id.slice(5, req.params.id.length);
	const data = req.body.data;

	server_config[id] = data;

	saveServerConfig();

	res.send({
		msg: "OK",
	});
});

app.listen(config.port, () => {
	console.log(`Listening on port ${config.port}!`);
});

function saveServerConfig() {
	fs.writeFileSync("./src/server_config.json", JSON.stringify(server_config));
}
