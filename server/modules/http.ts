import express, {Express} from "express";
import next from "next";
import nextServer from "next/dist/next-server/server/next-server";
import morgan from "morgan";

class WebServer {
	private dev = process.env.NODE_ENV !== "production";
	private initialized = false;
	private port = 3000;
	private app: nextServer;
	private server: Express;

	constructor() {
		this.app = next({dev: this.dev});
		this.server = express();

		this.server.use(morgan("dev"));
		this.server.use(express.json());
	}

	public init = () => {
		if (this.initialized) {
			return console.error("WebServer already initialized!");
		}

		this.app.prepare().then(() => {
			const handle = this.app.getRequestHandler();

			this.server.get("*", (req, res) => {
				handle(req, res);
			});

			this.server.listen(this.port, () => {
				this.initialized = true;
				console.log(
					`WG-Dashboard webserver now listening on port ${this.port}!`
				);
			});
		});
	};
}

export default new WebServer();
