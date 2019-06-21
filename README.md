# WireGuard-Dashboard

## Description

#### What is this?
WireGuard-Dashboard is a user friendly and easy to use interface to manage your WireGuard instance and peers.

#### Why did we make this?
We made this dashboard to simplify the setup of WireGuard. Instead of having to use the terminal to manage settings we wanted an easy to use and nice looking GUI.

## Requirements

* Ubuntu 18.04
* Root user

## Installation

#### Automatic Install
With our install script all the needed packages for WireGuard and WireGuard-Dashboard will be installed. Just follow the given steps.

1. Run the install script
	* `curl https://raw.githubusercontent.com/team-centric-software/wireguard-dashboard/master/install_script.sh | bash`
2. Enjoy

#### Manual Install
1. Download & install wireguard and wg-quick
2. Download & install node 10
2. Download and unzip the dashboard
3. Set `net.ipv4.ip_forward=1` in sysctl
4. Optional: Enable ufw and forward port 22, 3000 and the desired port of the wireguard instance
5. Optional: Put the dashboard in autostart

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

## Known Problems
* No HTTPS
