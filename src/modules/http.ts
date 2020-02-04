import express, {Express} from "express";
import morgan from "morgan";

class webServer {
	private app: Express;

	constructor() {
		this.app = express();
	}

	public init = () => {
		this.app.use(morgan("dev"));
		this.app.use(express.json());

		this.app.get("/", (req, res) => {
			res.send("Hello there!");
		});

		this.app.use((req, res) => {
			res.send("404");
		});
	};
}

export default new webServer();
