const express = require("express");
const morgan = require("morgan");
const app = express();
const nunjucks = require("nunjucks");

const config = {
	port: 3000,
}

app.use(morgan("dev"));
app.use("/static", express.static("static"));
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
	res.render("dashboard.njk", {});
});

app.listen(config.port, () => {
	console.log(`Listening on port ${config.port}!`);
});
