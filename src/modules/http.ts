import express, {Express} from "express";
import morgan from "morgan";

class webServer {
	private app: Express;
	private initialized = false;

	constructor() {
		this.app = express();
	}

	public init = () => {
		if (!this.initialized) {
			this.app.use(morgan("dev"));
			this.app.use(express.json());

			this.app.get("/", (req, res) => {
				res.send("Hello there!");
			});

			this.app.use((req, res) => {
				res.send("404 - not found");
			});

			this.app.listen(3000, () => {
				this.initialized = true;
				console.log(
					"WG-Dashboard webserver now listening on port 3000!"
				);
			});
		}
	};
}

export default new webServer();
