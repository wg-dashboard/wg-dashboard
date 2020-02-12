import React, {useEffect} from "react";

import {observable, action} from "mobx";
import {observer} from "mobx-react";

import {getUsers} from "../api";
import Layout from "../components/layout";

class UsersState {
	@observable users: any[] = [];

	@action setUsers = (users: any[]) => (this.users = users);
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
		<Layout>
			Welcome to the users page..
			{usersState.users.length > 0 && (
				<div>
					{usersState.users.map((el: any) => (
						<div key={el.id}>{JSON.stringify(el)}</div>
					))}
				</div>
			)}
		</Layout>
	);
});
