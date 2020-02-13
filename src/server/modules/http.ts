import express, {Express, Request, Response, NextFunction} from "express";
import morgan from "morgan";
import data from "../modules/data";
import path from "path";

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
			this.server.use(morgan("dev"));
			this.server.use(express.json());
			this.server.use(data.expressSession());

			// the loginHandler handles both login and register
			this.server.post("/api/login", this.loginHandler);
			this.server.post("/api/logout", this.logoutHandler);

			/* Private endpoints */
			this.server.get("/api/settings", this.isUserAuthenticated, this.getSettingsHandler);
			this.server.get("/api/peers", this.isUserAuthenticated, this.getPeersHandler);
			// this.server.put("/api/peer", this.createPeer);

			this.server.get("/api/users", this.isUserAuthenticated, this.getUsersHandler);
			this.server.put("/api/users", this.isUserAuthenticated, this.isUserAdmin, this.createUserHandler);
			this.server.delete("/api/users", this.isUserAuthenticated, this.isUserAdmin, this.deleteUserHandler);

			this.server.get("*", (req: Request, res: Response) => {
				res.sendFile(path.resolve(__dirname, "../../public/index.html"));
			});

			this.server.listen(this.port, () => {
				console.log(`WG-Dashboard webserver now listening on port ${this.port}!`);
				this.initialized = true;
				resolve(true);
			});
		});
	};

	public getPeersHandler = async (_req: Request, res: Response) => {
		try {
			const peers = await data.getAllPeers();

			return res.send({
				status: 200,
				peers,
			});
		} catch (err) {
			return res.send({
				status: 400,
				message: err,
			});
		}
	};

	public createUserHandler = async (req: Request, res: Response) => {
		try {
			const _data = req.body;
			_data.password = _data.new_password;
			_data.passwordConfirm = _data.new_password;

			const user = await data.createRegisterUser(_data);

			return res.send({
				status: 201,
				user: {
					id: user.id,
					admin: user.admin,
				},
			});
		} catch (err) {
			console.log(err);
			return res.send({
				status: 400,
				message: err,
			});
		}
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

	public deleteUserHandler = async (req: Request, res: Response) => {
		try {
			await data.deleteUser(req.body.id);

			return res.send({
				status: 200,
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

	private isUserAdmin = (req: Request, res: Response, next: NextFunction) => {
		if (!req.session?.user?.admin) {
			return res.send({
				status: 403,
				message: "User not authorized",
			});
		}

		next();
	};

	private isUserAuthenticated = (req: Request, res: Response, next: NextFunction) => {
		if (!req.session?.authed) {
			res.cookie("userData", "null", {maxAge: 100}); // reset cookie on clientside - he might think he's still authed
			return res.send({
				status: 401,
				message: "User not authenticated",
			});
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

			res.cookie("userData", null);
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

			res.cookie("userData", JSON.stringify({id: user.id, admin: user.admin, loggedIn: true}));
			return res.send({
				status: 200,
				user: {
					id: user.id,
					admin: user.admin,
				},
			});
		} catch (err) {
			return res.send(err);
		}
	};
}

export default new WebServer();
