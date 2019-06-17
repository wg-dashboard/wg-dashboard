const express = require("express");
const morgan = require("morgan");
const app = express();
const nunjucks = require("nunjucks");

const server_config = require("./server_config.json");

const config = {
	port: 3000,
}

app.use(morgan("dev"));
app.use("/static", express.static("static"));

app.use(express.json());
// app.use(express.urlencoded({
// 	extended: true,
// }));

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

app.post("/api/createpeer", (req, res) => {
	console.log("request:", req.body);
});

app.listen(config.port, () => {
	console.log(`Listening on port ${config.port}!`);
});
