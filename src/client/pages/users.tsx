import React, {useEffect} from "react";

import {observable, action} from "mobx";
import {observer} from "mobx-react";

import Table from "../components/table";
import {getUsers, deleteUser, createUser} from "../api";

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
		this.users.push(user);
	};

	@action deleteUser = (id: number) => {
		const index = this.users.findIndex(el => el.id === id);
		this.users.splice(index, 1);
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
			{usersState.users.length > 0 && (
				<div>
					<Table
						title={"Users"}
						columns={[
							{title: "Name", field: "name"},
							{title: "Password", field: "new_password"},
							{title: "Admin", field: "admin", type: "boolean"},
						]}
						data={usersState.users}
						editable={
							states.user.admin
								? {
										isEditable: (rowData: IUser) => rowData.id !== states.user.id,
										isDeletable: (rowData: IUser) => rowData.id !== states.user.id, // only name(a) rows would be deletable
										onRowAdd: (newData: IUser) =>
											new Promise(async (resolve, reject) => {
												try {
													console.log(newData);
													const user = await createUser(newData);
													delete newData["new_password"];
													usersState.addUser(Object.assign(newData, user));
													resolve();
												} catch (e) {
													reject(e);
												}
											}),
										onRowUpdate: (newData: IUser, oldData: IUser) =>
											new Promise((resolve, reject) => {
												resolve();
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
				</div>
			)}
		</>
	);
});
