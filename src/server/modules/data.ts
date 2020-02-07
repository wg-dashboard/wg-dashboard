import "reflect-metadata";
import {createConnection, Connection} from "typeorm";
import ExpressSession from "express-session";
import {TypeormStore} from "typeorm-store";
import bcrypt from "bcrypt";

import {User} from "../orm/entity/User";
import {Peer} from "../orm/entity/Peer";
import {Settings} from "../orm/entity/Settings";
import {Session} from "../orm/entity/Session";
import {IUser, IPeer} from "../interfaces";
import config from "../config";
import {generateKeyPair, getNetworkAdapter, getNetworkIP} from "./sh";
// import {cidr} from "node-cidr";

class Data {
	private connection: Connection | null = null;

	public init = async () => {
		this.connection = await createConnection();
		await this.ensureDefaultSettings();
	};

	public ensureDefaultSettings = async () => {
		const keyPair = await generateKeyPair();
		const networkAdapter = await getNetworkAdapter();
		const networkIP = await getNetworkIP(networkAdapter);
		const defaultSettings = {
			webserver_port: 3000,
			public_key: keyPair.public_key,
			private_key: keyPair.private_key,
			ip_address: networkIP,
			virtual_ip_address: "10.13.37.1",
			cidr: 24,
			port: 58210,
			dns: "1.1.1.1",
			network_adapter: networkAdapter,
			config_path: "/etc/wireguard/wg0.conf",
			allowed_ips: "0.0.0.0/0",
			private_traffic: false,
			dns_over_tls: true,
			tls_servername: "tls.cloudflare-dns.com",
		};

		for await (let [key, value] of Object.entries(defaultSettings)) {
			const settingInDB = (await this.getSetting(key))?.value;

			if (!settingInDB) {
				await this.setSetting(key, value);
			}
		}
	};

	public setSetting = async (_key: string, _value: string | number | boolean) => {
		try {
			let setting;
			setting = await this.getSetting(_key);

			if (setting) {
				setting.value = JSON.stringify(_value);
			} else {
				setting = new Settings();
				setting.key = _key;
				setting.value = JSON.stringify(_value);
			}

			await this.connection!.manager.save(setting);
			return setting;
		} catch (err) {
			throw err;
		}
	};

	public getSetting = async (key: string) => {
		return await this.connection!.manager.findOne(Settings, {key});
	};

	private getAvailableIP = async () => {
		/*const virtual_ip_address = (await this.getSetting("virtual_ip_address"))?.value;
		const serverCIDR = (await this.getSetting("cidr"))?.value;
		const peers = await this.connection!.manager.find(Peer);

		const ipList: string[] = cidr.ips(`${virtual_ip_address}/${serverCIDR}`);
		ipList.splice(
			ipList.findIndex(el => el === virtual_ip_address),
			1
		);

		peers.forEach(peer => {
			ipList.splice(
				ipList.findIndex(el => el === peer.virtual_ip),
				1
			);
		});*/

		return "0.0.0.0"; // ipList[0];
	};

	private isValidIP = (ip: string) => {
		const ipCheck = new RegExp(/^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/);

		return ipCheck.test(ip);
	};

	public createUpdatePeer = async (data: IPeer) => {
		const peer = await this.getPeer(data);

		if (peer) {
			throw new Error("Peer with given device already exists");
		}

		if (!data) {
			throw new Error("No peer data provided");
		}

		if (!data.device.length) {
			throw new Error("Device name is mandatory");
		}

		if (data.active == null) {
			throw new Error("Active status is mandatory");
		}

		if (data.virtual_ip != null) {
			if (!this.isValidIP(data.virtual_ip)) {
				throw new Error("Invalid IP provided");
			}
		}

		try {
			const peer = new Peer();
			peer.active = data.active;
			peer.device = data.device;
			peer.virtual_ip = data.virtual_ip || (await this.getAvailableIP());

			const {public_key, private_key} = await generateKeyPair();
			peer.public_key = public_key;
			peer.private_key = private_key;

			await this.connection!.manager.save(peer);

			return peer;
		} catch (err) {
			throw err;
		}
	};

	public createUser = async (data: IUser) => {
		try {
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
		} catch (err) {
			throw err;
		}
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

	public getPeer = async (data: IPeer) => {
		return this.connection!.manager.findOne(Peer, {device: data.device});
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
