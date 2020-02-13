import {Express, Request, Response} from "express";
import data from "../data";
import auth from "./auth";

class Peers {
	createRoutes(express: Express) {
		express.get("/api/peers", this.getPeersHandler);
		express.put("/api/peer", auth.isUserAdmin, this.createPeer);
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

	private createPeer = async (req: Request, res: Response) => {
		try {
			const peer = await data.createUpdatePeer(req.body.peer);

			res.send({
				status: 200,
				peer,
			});
		} catch (err) {
			res.send({
				status: 400,
				message: err,
			});
		}
	};
}

export default new Peers();
