import {getUsers, getPeers} from "../components/api";
import Layout from "../components/layout";
import {IPeer} from "../server/interfaces";

const users = (props: {peers: IPeer[]}) => {
	return (
		<Layout>
			Welcome to the peers page.. existing peers: {props.peers.length}
			{props.peers.map((peer: IPeer, i) => {
				return <div key={i}>{JSON.stringify(peer)}</div>;
			})}
		</Layout>
	);
};

users.getInitialProps = async (ctx: any) => {
	const peers = await getPeers(ctx);

	return {
		peers,
	};
};

export default users;
