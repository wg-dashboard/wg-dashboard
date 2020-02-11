import express, {Express, Request, Response, NextFunction} from "express";
import next from "next";
import nextServer from "next/dist/next-server/server/next-server";
import morgan from "morgan";
import data from "../modules/data";

class WebServer {
	private dev = process.env.NODE_ENV !== "production";
	private initialized = false;
	private port = 3000;
	private app: nextServer;
	private server: Express;

	constructor() {
		this.app = next({dev: this.dev, ...(this.dev ? {dir: "./src"} : {})});
		this.server = express();
	}

	public init = () => {
		return new Promise((resolve, reject) => {
			if (this.initialized) {
				return reject("WebServer already initialized!");
			}

			this.server.use(morgan("dev"));
			this.server.use(express.json());
			this.server.use(data.expressSession());

			this.app
				.prepare()
				.then(async () => {
					const handle = this.app.getRequestHandler();

					/* Public endpoints */
					this.server.get("/", (req: Request, res: Response, next: NextFunction) => {
						if (req.session?.authed) {
							return this.app.render(req, res, "/dashboard", req.query);
						}

						next();
					});

					this.server.get("/dashboard", this.isUserAuthed, (req: Request, res: Response) => {
						this.app.render(req, res, "/dashboard", req.query);
					});

					// the loginHandler handles both login and register
					this.server.post("/api/login", this.loginHandler);
					this.server.post("/api/logout", this.logoutHandler);

					/* Private endpoints */
					this.server.get("/api/settings", this.isUserAuthed, this.getSettingsHandler);
					this.server.get("/api/users", this.isUserAuthed, this.getUsersHandler);
					// this.server.get("/api/peers", this.isUserAuthed);

					// this.server.put("/api/peer", this.createPeer);

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
	public getUsersHandler = async (_req: Request, res: Response) => {
		try {
			const users = await data.getAllUsers();

			return res.send({
				status: 200,
				users,
			});
		} catch (err) {
			return res.send({
				status: 400,
				message: err,
			});
		}
	};

	public getSettingsHandler = async (_req: Request, res: Response) => {
		try {
			const settings = await data.getAllSettings();

			return res.send({
				status: 200,
				settings,
			});
		} catch (err) {
			return res.send({
				status: 400,
				message: err,
			});
		}
	};

	private createPeer = async (req: Request, res: Response) => {
		try {
			const peer = await data.createUpdatePeer(req.body.peer);

			res.send({
				status: 200,
				peer,
			});
		} catch (err) {
			res.send({
				status: 400,
				message: err,
			});
		}
	};

	private genericErrorHandler = (err: Error, req: Request, res: Response, _next: NextFunction) => {
		if (req.path.includes("/api/")) {
			return res.status(500).send({
				status: 500,
				message: err.message,
			});
		}

		this.app.renderError(err, req, res, "/index");
	};

	private isUserAuthed = (req: Request, _res: Response, next: NextFunction) => {
		if (!req.session?.authed) {
			return next(new Error("User not authenticated"));
		}

		next();
	};

	private logoutHandler = async (req: Request, res: Response) => {
		req.session?.destroy(err => {
			if (err) {
				return res.send({
					status: 500,
					message: err.message,
				});
			}

			return res.send({
				status: 200,
			});
		});
	};

	private loginHandler = async (req: Request, res: Response) => {
		try {
			const user = await data.createRegisterUser(req.body);

			req.session!.authed = true;
			req.session!.user = {
				id: user.id,
				admin: user.admin,
			};

			return res.send({
				status: 200,
			});
		} catch (err) {
			return res.send(err);
		}
	};
}

export default new WebServer();
