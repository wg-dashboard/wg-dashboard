export interface IUser {
	id?: number;
	name: string;
	password: string;
	passwordConfirm?: string;
	admin: boolean;
}
