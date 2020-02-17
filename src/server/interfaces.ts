export interface IUser {
	id?: number;
	name: string;
	password: string;
	passwordConfirm?: string;
	new_password?: string;
	admin: boolean;
}

export interface IPeer {
	id?: number;
	active: boolean;
	device: string;
	public_key?: string;
	private_key?: string;
	virtual_ip: string;
}

export type ISettingKey =
	| "webserver_port"
	| "public_key"
	| "private_key"
	| "ip_address"
	| "virtual_ip_address"
	| "cidr"
	| "port"
	| "dns"
	| "network_adapter"
	| "config_path"
	| "allowed_ips";

export interface ISetting {
	key: ISettingKey;
	value: string;
}
