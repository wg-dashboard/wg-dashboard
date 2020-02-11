import {getUsers} from "../components/api";
import Layout from "../components/layout";
import {IUser} from "../server/interfaces";

const users = (props: {users: IUser[]}) => {
	return (
		<Layout>
			Welcome to the users page.. existing users: {props.users.length}
			{props.users.map((user: IUser, i) => {
				return <div key={i}>{JSON.stringify(user)}</div>;
			})}
		</Layout>
	);
};

users.getInitialProps = async (ctx: any) => {
	const users = await getUsers(ctx);

	return {
		users,
	};
};

export default users;
