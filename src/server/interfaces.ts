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

export interface ISetting {
	key: string;
	value: string;
}
