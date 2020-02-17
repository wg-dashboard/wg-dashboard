import {Express, Request, Response} from "express";
import data from "../data";
import auth from "./auth";
import {saveServerConfig, getClientConfig} from "../templates";
import {enablePeer, disablePeer} from "../sh";
import {IPeer} from "../../interfaces";

class Peers {
	createRoutes(express: Express) {
		express.get("/api/peers", this.getPeersHandler);

		express.post("/api/peers", auth.isUserAdmin, this.createPeerHandler);
		express.put("/api/peers", auth.isUserAdmin, this.updatePeerHandler);
		express.delete("/api/peers", auth.isUserAdmin, this.deletePeerHandler);

		express.get("/api/peers/download/:id", auth.isUserAuthenticated, this.downloadPeerConfig);
	}

	public getPeersHandler = async (_req: Request, res: Response) => {
		try {
			const peers = await data.getAllPeers();

			return res.send({
				status: 200,
				peers,
			});
		} catch (err) {
			return res.send({
				status: 500,
				message: err,
			});
		}
	};

	private createPeerHandler = async (req: Request, res: Response) => {
		try {
			const peer = await data.createUpdatePeer(req.body.peer);

			await this.savePeer(peer);

			res.send({
				status: 201,
				peer,
			});
		} catch (err) {
			console.log(err);
			res.send({
				status: 500,
				message: err,
			});
		}
	};

	private updatePeerHandler = async (req: Request, res: Response) => {
		try {
			const peer = await data.createUpdatePeer(req.body.peer, true);

			await this.savePeer(peer);

			res.send({
				status: 200,
				peer,
			});
		} catch (err) {
			console.log(err);
			res.send({
				status: 500,
				message: err,
			});
		}
	};

	public deletePeerHandler = async (req: Request, res: Response) => {
		try {
			const peer = await data.deletePeer(req.body.id);

			if (peer) {
				peer.active = false;
				await this.savePeer(peer);
			}

			res.send({
				status: 200,
			});
		} catch (err) {
			console.log(err);
			res.send({
				status: 500,
				message: err,
			});
		}
	};

	public downloadPeerConfig = async (req: Request, res: Response) => {
		try {
			const peer = await data.getPeerByID(parseInt(req.params.id, 10));

			if (peer != null) {
				const config = getClientConfig(await data.getAllSettings(), peer);

				res.send(config);
			} else {
				res.send({
					status: 400,
					message: "Peer does not exist",
				});
			}
		} catch (err) {
			console.log(err);
			res.send({
				status: 500,
				message: err,
			});
		}
	};

	private savePeer = async (peer: IPeer) => {
		await saveServerConfig(await data.getAllSettings(true), await data.getAllPeers());

		if (peer.active) {
			await enablePeer(peer);
		} else {
			await disablePeer(peer);
		}
	};
}

export default new Peers();
