import {ISettingKey, IPeer} from "../interfaces";
import {Settings} from "../orm/entity/Settings";
import fs from "fs";

const getConfigItem = (config: Settings[], item: ISettingKey) => {
	return JSON.parse(config.find(el => el.key === item)?.value || "");
};

export const saveServerConfig = (config: Settings[], peers: IPeer[]) => {
	return new Promise((resolve, reject) => {
		const conf = [];

		conf.push(`[Interface]`);
		conf.push(`Address = ${getConfigItem(config, "virtual_ip_address")}/${getConfigItem(config, "cidr")}`);
		conf.push(`PrivateKey = ${getConfigItem(config, "private_key")}`);
		conf.push(`ListenPort = ${getConfigItem(config, "port")}`);
		conf.push(
			`PostUp = iptables -A FORWARD -i %i -j ACCEPT; iptables -A FORWARD -o %i -j ACCEPT; iptables -t nat -A POSTROUTING -o ${config.find(
				el => el.key === "network_adapter"
			)} -j MASQUERADE`
		);
		conf.push(
			`PostDown = iptables -D FORWARD -i %i -j ACCEPT; iptables -D FORWARD -o %i -j ACCEPT; iptables -t nat -D POSTROUTING -o ${config.find(
				el => el.key === "network_adapter"
			)} -j MASQUERADE`
		);
		conf.push(`SaveConfig = false`);
		conf.push(``);

		const allowedIPs = getConfigItem(config, "allowed_ips");
		for (let peer of peers) {
			if (peer.active) {
				conf.push(`[Peer]`);
				conf.push(`# ${peer.device}`);
				conf.push(`PublicKey = ${peer.public_key}`);
				conf.push(`AllowedIPs = ${allowedIPs}/32`);
				conf.push(``);
			}
		}

		const savePath = getConfigItem(config, "config_path");

		fs.writeFile(savePath, conf.join("\n"), err => {
			if (err) {
				return reject(err);
			}

			resolve();
		});
	});
};

export const getClientConfig = (config: Settings[], peer: IPeer) => {
	const conf = [];

	const dns = getConfigItem(config, "dns");
	conf.push(`[Interface]`);
	conf.push(`Address = ${peer.virtual_ip}/32`);
	conf.push(`PrivateKey = ${peer.private_key}`);
	conf.push(`DNS = ${dns}`);
	conf.push(``);
	conf.push(`[Peer]`);
	conf.push(`# ${peer.device}`);
	conf.push(`PublicKey = ${peer.public_key}`);
	conf.push(`AllowedIPs = ${getConfigItem(config, "allowed_ips")}`);
	conf.push(``);
	conf.push(`PersistentKeepalive = 25`);

	return conf.join("\n");
};
