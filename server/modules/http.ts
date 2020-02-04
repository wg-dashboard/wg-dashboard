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
		this.app = next({dev: this.dev});
		this.server = express();

		this.server.use(morgan("dev"));
		this.server.use(express.json());
	}

	public isUserAuthed = (
		req: Request,
		_res: Response,
		next: NextFunction
	) => {
		if (req.authed) {
			return next(new Error("User not authenticated"));
		}

		next();
	};

	public init = () => {
		if (this.initialized) {
			return console.error("WebServer already initialized!");
		}

		this.app.prepare().then(() => {
			const handle = this.app.getRequestHandler();

			this.server.get("/users", this.isUserAuthed, (req, res) => {
				res.send({status: 200, message: req.authed});
			});

			this.server.get("/api/ping", (_req, res) =>
				res.send({status: 200, message: "pong"})
			);

			this.server.get(
				"*",
				(
					req: Request,
					res: Response,
					_next: NextFunction,
					err?: Function
				) => {
					console.log(err);

					handle(req, res);
				}
			);

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
