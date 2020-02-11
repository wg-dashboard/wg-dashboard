import SettingsForm from "../components/settingsForm";
import {getPeers} from "../components/api";
import Layout from "../components/layout";

const peers = (props: any) => {
	return <Layout>Welcome to the peers page..</Layout>;
};

peers.getInitialProps = async (ctx: any) => {
	const peers = await getPeers(ctx);

	return {
		peers,
	};
};

export default peers;
