import {ISetting, ISettingKey, IPeer} from "../interfaces";
import {Settings} from "../orm/entity/Settings";

const getConfigItem = (config: Settings[], item: ISettingKey) => {
	console.log(item, "parsing", config.find(el => el.key === item)?.value);
	return JSON.parse(config.find(el => el.key === item)?.value || "");
};

export const server = (config: Settings[], peers: IPeer[]) => {
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
		`iptables -D FORWARD -i %i -j ACCEPT; iptables -D FORWARD -o %i -j ACCEPT; iptables -t nat -D POSTROUTING -o ${config.find(
			el => el.key === "network_adapter"
		)} -j MASQUERADE`
	);
	conf.push(`SaveConfig = false`);
	conf.push(``);

	for (let peer of peers) {
		if (peer.active) {
			conf.push(`[Peer]`);
			conf.push(`# ${peer.device}`);
			conf.push(`PublicKey = ${peer.public_key}`);
			conf.push(`AllowedIPs = ${peer.virtual_ip}/32`);
			conf.push(``);
		}
	}

	return conf.join("\n");
};

export const client = (config: Settings[], peer: IPeer) => {
	const conf = [];

	conf.push(`[Interface]`);
	conf.push(`Address = ${peer.virtual_ip}/32`);
	conf.push(`PrivateKey = ${peer.private_key}`);
	conf.push(``);
	conf.push(`[Peer]`);
	conf.push(`# ${peer.device}`);
	conf.push(`PublicKey = ${peer.public_key}`);
	conf.push(`AllowedIPs = ${getConfigItem(config, "allowed_ips").join(",")}`);
	conf.push(``);
	conf.push(`PersistentKeepalive = 25`);

	return conf.join("\n");
};
