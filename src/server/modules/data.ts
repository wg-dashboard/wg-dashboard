import "reflect-metadata";
import {createConnection, Connection} from "typeorm";
import {User} from "../orm/entity/User";
import {IUser} from "../interfaces";

class Data {
	private connection: Connection | undefined;

	public init = async () => {
		this.connection = await createConnection();
	};

	public createUser = async (data: IUser) => {
		console.log(data);

		const user = new User();
		user.name = data.name;
		user.password = data.password;
		user.admin = false;

		console.log(user);
		await this.connection?.manager.save(user);
	};

	public getUser = async (data: IUser) => {
		return this.connection?.manager.findOne(User, {name: data.name});
	};
}

export default new Data();
