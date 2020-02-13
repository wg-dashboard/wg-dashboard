import {Express, Request, Response, NextFunction} from "express";
import data from "../data";

class Auth {
	createRoutes(express: Express) {
		// the loginHandler handles both login and register
		express.post("/api/login", this.loginHandler);
		express.post("/api/logout", this.logoutHandler);
	}

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

	public isUserAdmin = (req: Request, res: Response, next: NextFunction) => {
		if (!req.session?.user?.admin) {
			return res.send({
				status: 403,
				message: "User not authorized",
			});
		}

		next();
	};

	public isUserAuthenticated = (req: Request, res: Response, next: NextFunction) => {
		if (!req.session?.authed) {
			res.cookie("userData", "null", {maxAge: 100}); // reset cookie on clientside - he might think he's still authed
			return res.send({
				status: 401,
				message: "User not authenticated",
			});
		}

		next();
	};
}

export default new Auth();
