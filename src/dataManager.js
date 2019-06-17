const fs = require("fs");

exports.saveServerConfig = (server_config, cb) => {
	fs.writeFile("server_config.json", JSON.stringify(server_config, null, 2), cb);
}

exports.loadServerConfig = (cb) => {
	fs.readFile("server_config.json", (err, buffer) => {
		if (err) {
			cb(err);
			return;
		}

		let parsed;

		try {
			parsed = JSON.parse(buffer.toString());
		} catch (err) {
			cb(err);
			return;
		}

		cb(null, parsed);
	});
}
