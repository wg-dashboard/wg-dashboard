import * as util from "util";
import * as child_process from "child_process";
import * as os from "os";
import {IPeer} from "../interfaces";

const exec = util.promisify(child_process.exec);

// generate a public and private key
export const generateKeyPair = async () => {
	let private_key = "";

	try {
		const {stdout, stderr} = await exec(`wg genkey`);

		if (stderr) {
			console.error(stderr);
			throw new Error(stderr);
		}

		private_key = stdout.replace(/\n/g, "");
	} catch (err) {
		console.error(err);
		throw new Error("Could not generate private key");
	}

	try {
		const {stdout, stderr} = await exec(`echo "${private_key}" | wg pubkey`);

		if (stderr) {
			console.error(stderr);
			throw new Error(stderr);
		}

		const public_key = stdout.replace(/\n/g, "");

		return {
			public_key,
			private_key,
		};
	} catch (err) {
		console.error(err);
		throw new Error("Could not generate public key");
	}
};

// turn wireguard on/off
export const toggleWireguard = async (on: boolean = true) => {
	try {
		const {stderr} = await exec(`systemctl ${on ? "start" : "stop"} wg-quick@wg0`);

		if (stderr) {
			console.error(stderr);
			throw new Error(stderr);
		}
	} catch (err) {
		console.error(err);
		throw new Error("Could not stop wiregaurd");
	}
};

// get the last n lines of logs of the wg0 service
export const getWireguardLogs = async () => {
	try {
		const {stdout, stderr} = await exec(`journalctl -u wg-quick@wg0.service -n 100`);

		if (stderr) {
			console.error(stderr);
			throw new Error(stderr);
		}

		return stdout;
	} catch (err) {
		console.error(err);
		throw new Error("Could not get logs");
	}
};

// get the default network adapter
export const getNetworkAdapter = async () => {
	try {
		const {stdout, stderr} = await exec(
			os.platform() === "darwin" ? `netstat -rn | grep default | cut -d ' ' -f 30` : `ip route | grep default | cut -d ' ' -f 5`
		);

		if (stderr) {
			console.error("Could not get default network adapter", stderr);
			return "eth0";
		}

		return stdout.replace(/\n/g, "");
	} catch (err) {
		console.error("Could not get default network adapter", err);
		return "eth0";
	}
};

// get the public network ip by network adapter
export const getNetworkIP = async (networkadapter?: string) => {
	try {
		const {stdout, stderr} = await exec(
			`ifconfig ${networkadapter ? networkadapter : await getNetworkAdapter()} | grep inet | head -n 1 | xargs | cut -d ' ' -f 2`
		);

		if (stderr) {
			console.error(stderr);
			throw new Error(stderr);
		}

		return stdout.replace(/\n/g, "");
	} catch (err) {
		console.error(err);
		throw new Error();
	}
};

// enable a peer without restarting wireguard
export const enablePeer = async (peer: IPeer) => {
	try {
		const {stdout, stderr} = await exec(`wg set wg0 peer ${peer.public_key} allowed-ips ${peer.virtual_ip}/32`);

		if (stderr) {
			console.error(stderr);
			throw new Error(stderr);
		}

		return stdout.replace(/\n/, "");
	} catch (err) {
		console.error(err);
		throw new Error("Could not enable peer");
	}
};

// disable a peer without restarting wireguard
export const disablePeer = async (peer: IPeer) => {
	try {
		const {stdout, stderr} = await exec(`wg set wg0 peer ${peer.public_key} remove`);

		if (stderr) {
			console.error(stderr);
			throw new Error(stderr);
		}

		return stdout.replace(/\n/, "");
	} catch (err) {
		console.error(err);
		throw new Error("Could not disable peer");
	}
};
