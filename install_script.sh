#!/bin/bash
set -ex

# Add WireGuard Repository
add-apt-repository -y ppa:wireguard/wireguard
# Install WireGuard
apt-get install -y wireguard
# Install Linux Kernel Headers
apt-get install -y linux-headers-$(uname -r)
# Enable IPv4 Packet Forwarding
sysctl -w net.ipv4.ip_forward=1
echo "net.ipv4.ip_forward=1" >> /etc/sysctl.conf
# Install NodeJS
curl https://deb.nodesource.com/setup_10.x | bash
apt-get install -y nodejs

# go into home folder
cd /home
# delete wireguard-dashboard folder to make sure it does not exist
rm -rf wireguard-dashboard
# Download WireGuard-Dashboard latest release
curl -L https://github.com/$(wget https://github.com/daluf/wireguard-dashboard/releases/latest -O - | egrep '/.*/.*/.*tar.gz' -o) --output wireguard-dashboard.tar.gz
# create directory for dashboard
mkdir wireguard-dashboard
# Unzip wireguard-dashboard
tar -xzf wireguard-dashboard.tar.gz --strip-components=1 -C wireguard-dashboard
# delete unpacked .tar.gz
rm wireguard-dashboard.tar.gz
# go into wireguard-dashboard folder
cd wireguard-dashboard
# install node modules
npm i

# Create Autostart Script
echo "[Unit]
Description=WireGuard-Dashboard autostart service
After=network.target

[Service]
WorkingDirectory=/home/wireguard-dashboard
ExecStart=/usr/bin/node /home/wireguard-dashboard/src/server.js

[Install]
Alias=wg-dashboard.service" > /etc/systemd/system/wg-dashboard.service
# reload systemct daemon
systemctl daemon-reload
# enable wg-dashboard in autostart
systemctl enable wg-dashboard
# start wg-dashboard service
systemctl start wg-dashboard

# enable port 22 in firewall
ufw allow 22
# enable firewall
ufw enable
# enable port 3000 in firewall
ufw allow 3000

echo "Done! You can now connect to your dashboard at port 3000"
