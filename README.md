# WireGuard-Dashboard

## Description

#### What is this?
WireGuard-Dashboard is a user friendly and easy to use interface to manage your WireGuard instance and peers.

#### Why did we make this?
We made this dashboard to simplify the setup of WireGuard. Instead of having to use the terminal to manage settings we wanted an easy to use and nice looking GUI.

## Requirements

* Ubuntu 18.04
* root user

## Installation

#### Automatic Install
With our install script all the needed packages for WireGuard and WireGuard-Dashboard will be installed. Just follow the given steps.

1. Connect to your server and open a ssh tunnel from remote to local on port 3000
	* `ssh -L 3000:localhost:3000 <your_vps_user>@<your_vps_ip>`
2. Run the install script
	* `curl https://raw.githubusercontent.com/team-centric-software/wireguard-dashboard/master/install_script.sh | bash`
3. Go to `localhost:3000` in your favorite browser
4. Enjoy

#### Manual Install
1. Connect to your VPS and open an ssh tunnel
	* `ssh -L 3000:localhost:3000 <your_vps_user>@<your_vps_ip>`
2. Download & install wireguard and wg-quick
3. Download & install node 10
4. Download and unzip the dashboard
5. Set `net.ipv4.ip_forward=1` in sysctl
6. Optional: Enable ufw and forward port 22 and the desired port of the wireguard instance
7. Optional: Put the dashboard in autostart

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
	* Network adapter
	* Virtual address
	* DNS
	* Allowed IP's for VPN clients
* Clean GUI
![Dashboard](dev/dashboard.png)
