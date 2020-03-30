import {Express, Request, Response} from "express";
import data from "../data";
import auth from "./auth";
import {saveServerConfig} from "../templates";
import {getWireguardLogs, toggleWireguard} from "../sh";

class Settings {
	createRoutes(express: Express) {
		express.get("/api/settings", this.getSettingsHandler);
		express.put("/api/settings", auth.isUserAdmin, this.updateSettingsHandler);

		express.get("/api/logs", auth.isUserAdmin, this.getLogsHandler);

		express.post("/api/start", auth.isUserAdmin);
		express.post("/api/stop", auth.isUserAdmin);
		express.post("/api/restart", auth.isUserAdmin);
	}

	private startHandler = (req: Request, res: Response) => {
		try {
			await toggleWireguard(true);
		} catch (err) {
			return res.send({
				status: 500,
				message: err,
			});
		}
	};

	private getLogsHandler = async (req: Request, res: Response) => {
		try {
			return res.send({
				status: 200,
				logs: await getWireguardLogs(),
			});
		} catch (err) {
			return res.send({
				status: 500,
				message: err,
			});
		}
	};

	private getSettingsHandler = async (_req: Request, res: Response) => {
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

	private updateSettingsHandler = async (req: Request, res: Response) => {
		try {
			// save config in db
			await data.overwriteSettings(req.body.settings);

			// save config on disk
			await saveServerConfig(await data.getAllSettings(true), await data.getAllPeers());

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
