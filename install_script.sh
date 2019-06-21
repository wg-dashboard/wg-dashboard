#!/bin/bash

add-apt-repository -y ppa:wireguard/wireguard
apt-get install -y wireguard
apt-get install -y linux-headers-$(uname -r)
sysctl -w net.ipv4.ip_forward=1
echo "net.ipv4.ip_forward=1" >> /etc/sysctl.conf
curl https://deb.nodesource.com/setup_10.x | bash
apt-get install -y nodejs

cd /home
curl -L https://github.com/daluf/wireguard-dashboard/archive/v1.tar.gz --output wireguard-dashboard.tar.gz
tar -xvzf wireguard-dashboard.tar.gz
rm wireguard-dashboard.tar.gz
cd wireguard-dashboard
npm i

echo "[Unit]
Description=WireGuard-Dashboard autostart service
After=network.target

[Service]
ExecStart=/usr/bin/node /home/wireguard-dashboard/src/server.js

[Install]
Alias=wg-dashboard.service" > /etc/systemd/system/wg-dashboard.service
systemctl start wg-dashboard
systemctl enable wg-dashboard


ufw allow 22
ufw enable
ufw allow 3000
