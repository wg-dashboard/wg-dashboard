import {Express, Request, Response} from "express";
import data from "../data";
import auth from "./auth";

class Settings {
	createRoutes(express: Express) {
		express.get("/api/settings", this.getSettingsHandler);
		express.put("/api/settings", this.updateSettingsHandler);
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
				status: 500,
				message: err,
			});
		}
	};

	public updateSettingsHandler = async (req: Request, res: Response) => {
		try {
			await data.overwriteSettings(req.body.settings);

			return res.send({
				status: 200,
			});
		} catch (err) {
			console.error(err);
			return res.send({
				status: 500,
				message: err,
			});
		}
	};
}

export default new Settings();
