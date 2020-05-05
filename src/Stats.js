let {execSync} = require("child_process");
const fs = require('fs');

class Stats {
	constructor() {
		this.json = {};
		this.scrape();
	}

	get() {
		return this.json;
	}

	scrape() {
		let peers = this.peers();
		let transfer = this.transfer();
		let handshake = this.latestHandshake();
		let json = {}

		peers.forEach(peer => {
			json[peer] = {
				sent: (transfer[peer][1] / (1024*1024)).toFixed(2),
				received: (transfer[peer][2] / (1024*1024)).toFixed(2),
				handshake: handshake[peer][1]
			}
		})

		let content = {}
		content[Date.now()] = json;

		this.json = content;
	}

	peers() {
		let peers = this.command('peers')
		peers = peers.split(/\n/);

		return this.clean(peers)
	}

	transfer() {
		let transfer = this.command('transfer')
		transfer = this.clean(transfer.split(/\n/));

		return this.format(transfer);
	}

	latestHandshake() {
		let handshake = this.command('latest-handshakes')
		handshake = this.clean(handshake.split(/\n/));
		let items = this.format(handshake)
		let date = Date.now()

		Object.keys(items).forEach(function (item, i) {
			items[item][1] = Math.floor((date - (items[item][1] * 1000)) / 1000);
		});

		return items
	}

	command(command) {
		return execSync(`wg show wg0 ${command}`).toString();
	};

	clean(array) {
		return array.filter(function(e){return e});
	}

	format(data) {
		let json = {}

		data.forEach(client => {
			let values = client.split(/\t/)
			let key = values[0];

			json[key] = values;
		});

		return json;
	}

	writeFile(content) {
		let date = new Date().toISOString().split('T')
		let path = `stats/${date[0]}.json`;

		if (!fs.existsSync(path)) {
			fs.open(path, 'w', function (err, file) {
				if (err) throw err;
			});
		}

		fs.readFile(path, 'utf8', function (err, data) {
			if (err) throw err;

			let updated = data === '' ? JSON.parse('{}') : JSON.parse(data);
			updated[Object.keys(content)[0]] = content[Object.keys(content)[0]];

			fs.writeFile (path, JSON.stringify(updated, null, 2), function(err) {
				if (err) throw err;
			});
		});
	}
}

module.exports = Stats
