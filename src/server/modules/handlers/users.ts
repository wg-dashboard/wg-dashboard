import {Express, Request, Response} from "express";
import data from "../data";
import auth from "./auth";

class Users {
	createRoutes(express: Express) {
		express.get("/api/users", this.getUsersHandler);

		express.post("/api/users", auth.isUserAdmin, this.createUserHandler);
		express.delete("/api/users", auth.isUserAdmin, this.deleteUserHandler);
		express.put("/api/users", auth.isUserAdmin, this.updateUserHandler);
	}

	public createUserHandler = async (req: Request, res: Response) => {
		try {
			const _data = req.body;

			// when an admin creates an user, no `password` or `passwordConfirm` is provided, only `new_password`
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

	public updateUserHandler = async (req: Request, res: Response) => {
		try {
			await data.updateUser(req.body.user);

			return res.send({
				status: 200,
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
}

export default new Users();
