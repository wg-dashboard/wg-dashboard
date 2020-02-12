import React, {useEffect} from "react";

import {observable, action} from "mobx";
import {observer} from "mobx-react";

import {getPeers} from "../api";

class PeersState {
	@observable peers: any[] = [];

	@action setPeers = (peers: any[]) => (this.peers = peers);
}
const peersState = new PeersState();

export default observer(() => {
	useEffect(() => {
		const initializeUsers = async () => {
			const initialUsers = await getPeers();
			peersState.setPeers(initialUsers);
		};

		initializeUsers();
	}, []);

	return (
		<>
			Welcome to the peers page..
			{peersState.peers.length > 0 && (
				<div>
					{peersState.peers.map((el: any) => (
						<div key={el.id}>{JSON.stringify(el)}</div>
					))}
				</div>
			)}
		</>
	);
});
