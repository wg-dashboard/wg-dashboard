import "reflect-metadata";
import {createConnection, Connection} from "typeorm";
import ExpressSession from "express-session";
import {TypeormStore} from "typeorm-store";
import bcrypt from "bcrypt";

import {User} from "../orm/entity/User";
import {Session} from "../orm/entity/Session";
import {IUser} from "../interfaces";
import config from "../config";

class Data {
	private connection: Connection | null = null;

	public init = async () => {
		this.connection = await createConnection();
	};

	public createUser = async (data: IUser) => {
		const user = new User();
		user.name = data.name;
		user.password = data.password;
		user.admin = false;

		const count = await this.connection!.manager.count(User);
		if (count < 1) {
			user.admin = true;
		}

		await this.connection!.manager.save(user);

		return user;
	};

	public createRegisterUser = (userData: IUser) => {
		return new Promise<IUser>(async (resolve, reject) => {
			// check if username and password are provided
			if ((!userData.name || !userData.password) && userData.name.length && userData.password.length) {
				reject({
					status: 400,
					message: "Username or Password is invalid",
				});
			}

			const user = await this.getUser(userData);

			// if passwordConfirm is provided, we want to register - not login
			if (userData.passwordConfirm) {
				if (user) {
					return reject({
						status: 400,
						message: "User with this name already exists!",
					});
				}

				if (!(userData.password === userData.passwordConfirm)) {
					return reject({
						status: 400,
						message: "Passwords do not match",
					});
				}

				try {
					userData.password = await bcrypt.hash(userData.password, 10);
					const user = await this.createUser(userData);

					return resolve(user);
				} catch (err) {
					console.error(err);
					return reject({
						status: 500,
						message: "Couldn't create user. Please consult the administrator.",
					});
				}
			}

			if (!user) {
				return reject({
					status: 404,
					message: "User not found",
				});
			}

			if (!(await bcrypt.compare(userData.password, user.password))) {
				return reject({
					status: 400,
					message: "Invalid password",
				});
			}

			resolve(user);
		});
	};

	public getUser = async (data: IUser) => {
		return this.connection!.manager.findOne(User, {name: data.name});
	};

	public expressSession = () => {
		const repository = this.connection!.getRepository(Session);

		return ExpressSession({
			resave: false,
			saveUninitialized: false,
			secret: config.get("sessionSecret"),
			store: new TypeormStore({
				repository,
			}),
		});
	};
}

export default new Data();
