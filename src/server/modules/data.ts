import "reflect-metadata";
import {createConnection, Connection} from "typeorm";
import ExpressSession from "express-session";
import {TypeormStore} from "typeorm-store";

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

		await this.connection!.manager.save(user);
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
