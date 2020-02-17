import React, {useEffect} from "react";

import {IPeer} from "../../server/interfaces";
import {observable, action} from "mobx";
import {observer} from "mobx-react";
import CropFree from "@material-ui/icons/CropFree";
import GetApp from "@material-ui/icons/GetApp";

import Table from "../components/table";
import {getPeers, createPeer, deletePeer, updatePeer, downloadPeerConfig} from "../api";
import states from "../states/index";

class PeersState {
	@observable peers: IPeer[] = [];

	@action setPeers = (peers: IPeer[]) => (this.peers = peers);

	@action addPeer = (peer: IPeer) => {
		console.log("adding peer", peer);
		this.peers.push(peer);
	};

	@action deletePeer = (id: number) => {
		const peerIndex = this.peers.findIndex(el => el.id === id);

		if (peerIndex > -1) {
			this.peers.splice(peerIndex, 1);
		}
	};

	@action updatePeer = (id: number, newPeer: IPeer) => {
		const peerIndex = this.peers.findIndex(el => el.id === id);

		if (peerIndex > -1) {
			this.peers[peerIndex] = newPeer;
		}
	};
}
const peersState = new PeersState();

export default observer(() => {
	useEffect(() => {
		const initializePeers = async () => {
			const initialPeers = await getPeers();
			peersState.setPeers(initialPeers);
		};

		initializePeers();
	}, []);

	console.log("view update");

	return (
		<>
			<Table
				title={"Peers"}
				actions={[
					{
						icon: () => <GetApp />,
						tooltip: "Download config",
						onClick: (event: any, rowData: IPeer) => {
							downloadPeerConfig(rowData.id, rowData.device);
						},
					},
					{
						icon: () => <CropFree />,
						tooltip: "Generate QR Code",
						onClick: (event: any, rowData: IPeer) => {},
					},
				]}
				columns={[
					{title: "Active", field: "active", type: "boolean"},
					{title: "Device", field: "device"},
					{title: "Virtual IP", field: "virtual_ip"},
					{title: "Public Key", editable: "never", field: "public_key"},
				]}
				data={peersState.peers.slice()} // ugly hack to convert the mobx proxy to a normal array
				editable={
					states.user.admin
						? {
								onRowAdd: (newData: IPeer) =>
									new Promise(async (resolve, reject) => {
										try {
											const peer = await createPeer(newData);
											peersState.addPeer(peer);
											resolve();
										} catch (e) {
											reject(e);
										}
									}),
								onRowUpdate: (newData: IPeer) =>
									new Promise(async (resolve, reject) => {
										try {
											await updatePeer(newData);
											peersState.updatePeer(newData.id, newData);
											resolve();
										} catch (e) {
											reject(e);
										}
									}),
								onRowDelete: (oldData: IPeer) =>
									new Promise(async (resolve, reject) => {
										try {
											await deletePeer(oldData.id);
											peersState.deletePeer(oldData.id);
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
