import express, {Express, Request, Response, NextFunction} from "express";
import next from "next";
import nextServer from "next/dist/next-server/server/next-server";
import morgan from "morgan";
import data from "../modules/data";
import bcrypt from "bcrypt";

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

					this.server.get("*", (req: Request, res: Response) => {
						return handle(req, res);
					});

					// the loginHandler handles both login and register
					this.server.post("/api/login", this.isUserNotAuthenticated, this.loginHandler);

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

	private genericErrorHandler = (err: Error, req: Request, res: Response, _next: NextFunction) => {
		if (req.path.includes("/api/")) {
			return res.status(500).send({
				status: 500,
				message: err.message,
			});
		}

		this.app.renderError(err, req, res, "/index");
	};

	private isUserNotAuthenticated = (req: Request, _res: Response, next: NextFunction) => {
		if (!req.session!.authed) {
			return next(new Error("User already authenticated"));
		}

		next();
	};

	private loginHandler = async (req: Request, res: Response) => {
		// check if username and password are provided
		if ((!req.body.name || !req.body.password) && req.body.name.length && req.body.password.length) {
			return res.status(400).send({
				status: 400,
				message: "Username or Password is invalid",
			});
		}

		const user = await data.getUser(req.body);

		// if passwordConfirm is provided, we want to register - not login
		if (req.body.passwordConfirm) {
			if (user) {
				return res.status(400).send({
					status: 400,
					message: "User with this name already exists!",
				});
			}

			if (!(req.body.password === req.body.passwordConfirm)) {
				return res.status(400).send({
					status: 400,
					message: "Passwords do not match",
				});
			}

			try {
				req.body.password = await bcrypt.hash(req.body.password, 10);
				await data.createUser(req.body);

				return res.send({
					status: 200,
					message: "User created! You can now log in.",
				});
			} catch (err) {
				console.error(err);
				return res.send({
					status: 500,
					message: "Couldn't create user. Please consult the administrator.",
				});
			}
		}

		if (!user) {
			return res.send({
				status: 404,
				message: "User not found",
			});
		}

		if (!(await bcrypt.compare(req.body.password, user.password))) {
			return res.send({
				status: 400,
				message: "Invalid password",
			});
		}

		req.session!.authed = true;
		req.session!.user = {
			id: user.id,
			admin: user.admin,
		};

		return res.send({
			status: 200,
			message: "Everything good!",
		});
	};
}

export default new WebServer();
