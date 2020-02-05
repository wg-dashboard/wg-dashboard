import express, {Express, Request, Response, NextFunction} from "express";
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
		this.app = next({dev: this.dev, ...(this.dev ? {dir: "./src"} : {})});
		this.server = express();

		this.server.use(morgan("dev"));
		this.server.use(express.json());
	}

	private genericErrorHandler = (err: Error, req: Request, res: Response, _next: NextFunction) => {
		this.app.renderError(err, req, res, "/index");
	};

	private isUserAuthed = (req: Request, _res: Response, next: NextFunction) => {
		if (!req.authed) {
			return next(new Error("User not authenticated"));
		}

		next();
	};

	public init = () => {
		return new Promise((resolve, reject) => {
			if (this.initialized) {
				return reject("WebServer already initialized!");
			}

			this.app
				.prepare()
				.then(() => {
					const handle = this.app.getRequestHandler();

					this.server.get("/authedendpoint", this.isUserAuthed, (_req, res) => {
						res.send("You are authed!");
					});

					this.server.get("*", (req: Request, res: Response) => {
						return handle(req, res);
					});

					this.server.use(this.genericErrorHandler);

					this.server.listen(this.port, () => {
						console.log(`WG-Dashboard webserver now listening on port ${this.port}!`);
						this.initialized = true;
						resolve(true);
					});
				})
				.catch(err => {
					reject(err);
				});
		});
	};
}

export default new WebServer();
