import React, {useEffect} from "react";

import {observable, action} from "mobx";
import {observer} from "mobx-react";

import Table from "../components/table";
import {getUsers, deleteUser, createUser, updateUser} from "../api";

import states from "../states/index";

interface IUser {
	id: number;
	name: string;
	password: string;
	new_password?: string;
	admin: boolean;
}

class UsersState {
	@observable users: IUser[] = [];

	@action setUsers = (users: IUser[]) => (this.users = users);

	@action addUser = (user: IUser) => {
		delete user["new_password"]; // we only need this property for the server

		this.users.push(user);
	};

	@action deleteUser = (id: number) => {
		const userIndex = this.users.findIndex(el => el.id === id);

		if (userIndex > -1) {
			this.users.splice(userIndex, 1);
		}
	};

	@action updateUser = (id: number, newUser: IUser) => {
		delete newUser["new_password"]; // we only need this property for the server

		const userIndex = this.users.findIndex(el => el.id === id);

		if (userIndex > -1) {
			this.users[userIndex] = newUser;
		}
	};
}
const usersState = new UsersState();

export default observer(() => {
	useEffect(() => {
		const initializeUsers = async () => {
			const initialUsers = await getUsers();
			usersState.setUsers(initialUsers);
		};

		initializeUsers();
	}, []);

	return (
		<>
			<Table
				title={"Users"}
				columns={[
					{title: "Name", field: "name"},
					{title: "Password", emptyValue: <div style={{opacity: 0.5}}>Hidden</div>, filtering: false, sorting: false, field: "new_password"},
					{title: "Admin", field: "admin", type: "boolean"},
				]}
				data={usersState.users}
				editable={
					states.user.admin
						? {
								isEditable: (rowData: IUser) => rowData.id !== states.user.id,
								isDeletable: (rowData: IUser) => rowData.id !== states.user.id,
								onRowAdd: (newData: IUser) =>
									new Promise(async (resolve, reject) => {
										try {
											const user = await createUser(newData);
											usersState.addUser(Object.assign(newData, user));
											resolve();
										} catch (e) {
											reject(e);
										}
									}),
								onRowUpdate: (newData: IUser) =>
									new Promise(async (resolve, reject) => {
										try {
											await updateUser(newData);
											usersState.updateUser(newData.id, newData);
											resolve();
										} catch (e) {
											console.error(JSON.stringify(e));
											reject(e);
										}
									}),
								onRowDelete: (oldData: IUser) =>
									new Promise(async (resolve, reject) => {
										try {
											await deleteUser(oldData.id);
											usersState.deleteUser(oldData.id);
											resolve();
										} catch (e) {
											reject(e);
										}
									}),
						  }
						: {}
				}
			/>
		</>
	);
});
