import express, {Express, Request, Response, NextFunction} from "express";
import morgan from "morgan";
import path from "path";

import data from "./data";
import auth from "./handlers/auth";
import users from "./handlers/users";
import settings from "./handlers/settings";
import peers from "./handlers/peers";

class WebServer {
	private dev = process.env.NODE_ENV !== "production";
	private initialized = false;
	private port = 3000;
	private server: Express;

	constructor() {
		this.server = express();
	}

	public init = () => {
		return new Promise((resolve, reject) => {
			if (this.initialized) {
				return reject("WebServer already initialized!");
			}

			this.server.use(express.static(path.resolve(__dirname, "../../public/static")));
			this.server.use(morgan(this.dev ? "dev" : "combined"));
			this.server.use(express.json());
			this.server.use(data.expressSession());

			// public endpoints
			auth.createRoutes(this.server);

			this.server.get(["/", "/dashboard", "/peers", "/users"], (req: Request, res: Response) => {
				res.sendFile(path.resolve(__dirname, "../../public/index.html"));
			});

			// private endpoints
			this.server.use(auth.isUserAuthenticated);
			settings.createRoutes(this.server);
			peers.createRoutes(this.server);
			users.createRoutes(this.server);

			this.server.listen(this.port, () => {
				console.log(`WG-Dashboard webserver now listening on port ${this.port}!`);
				this.initialized = true;
				resolve(true);
			});
		});
	};
}

export default new WebServer();
