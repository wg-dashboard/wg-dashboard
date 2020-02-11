import SettingsForm from "../components/settingsForm";
import {getUsers} from "../components/api";
import Layout from "../components/layout";

const users = (props: any) => {
	return <Layout>Welcome to the users page..</Layout>;
};

users.getInitialProps = async (ctx: any) => {
	const users = await getUsers(ctx);

	return {
		users,
	};
};

export default users;
