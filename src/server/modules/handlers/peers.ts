import {Express, Request, Response} from "express";
import data from "../data";
import auth from "./auth";

class Peers {
	createRoutes(express: Express) {
		express.get("/api/peers", this.getPeersHandler);
		express.post("/api/peers", auth.isUserAdmin, this.createPeerHandler);
		express.put("/api/peers", auth.isUserAdmin, this.updatePeerHandler);
		express.delete("/api/peers", auth.isUserAdmin, this.deletePeerHandler);
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
			await data.deletePeer(req.body.id);

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
}

export default new Peers();
