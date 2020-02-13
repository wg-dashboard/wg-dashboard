import {Express, Request, Response} from "express";
import data from "../data";
import auth from "./auth";

class Settings {
	createRoutes(express: Express) {
		express.get("/api/settings", this.getSettingsHandler);
	}

	public getSettingsHandler = async (_req: Request, res: Response) => {
		try {
			const settings = await data.getAllSettings();

			return res.send({
				status: 200,
				settings,
			});
		} catch (err) {
			return res.send({
				status: 400,
				message: err,
			});
		}
	};
}

export default new Settings();
