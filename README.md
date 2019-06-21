# WireGuard-Dashboard

## Description

#### What is this?
WireGuard-Dashboard is a user friendly and easy to use interface to manage your WireGuard instance and peers.

#### Why did we make this?
We made this dashboard to simplify the setup of WireGuard. Instead of having to use the terminal to manage settings we wanted an easy to use and nice looking GUI.

## Features

* Dashboard with login system
* Dashboard user management
* Automatic creation of public and private keys for server and peers
* Peer administration
	* Generation of QR Codes
	* VPN configuration download
	* Enable/Disable peers
* WireGuard server management
	* Restart
	* Logs
* WireGuard config management
	* Host / IP
	* Port
	* Network Adapter
	* Virtual Address
	* DNS
	* Allowed IP's for VPN Clients

## Installation

#### Automatic Install
With our install script all the needed packages for WireGuard and WireGuard-Dashboard will be installed. Just follow the given steps.

1. Download install_script.sh to your VPS
	* `curl https://github.com/daluf/wireguard-dashboard/blob/master/install_script.sh --output wg_install_script.sh`
2. Give the install script permissions
	* `chmod +x wg_install_script.sh`
3. Run the install script
	* `./sh install_script.sh`
4. Enjoy

#### Manual Install
1. Download & install wireguard and wg-quick
2. Download & install node 10
2. Download and unzip the dashboard
3. Set `net.ipv4.ip_forward=1` in sysctl
4. Optional: Enable ufw and forward port 22, 3000 and the desired port of the wireguard instance
5. Optional: Put the dashboard in autostart

## Known Problems
* No HTTPS
