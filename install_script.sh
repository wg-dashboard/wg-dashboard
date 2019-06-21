#!/bin/bash

add-apt-repository -y ppa:wireguard/wireguard
apt-get install -y wireguard
apt-get install -y linux-headers-$(uname -r)
sysctl -w net.ipv4.ip_forward=1
echo "net.ipv4.ip_forward=1" >> /etc/sysctl.conf
curl https://deb.nodesource.com/setup_10.x | bash
apt-get install -y nodejs

cd /home
curl -L https://github.com/$(wget https://github.com/daluf/wireguard-dashboard/releases/latest -O - | egrep '/.*/.*/.*tar.gz' -o) --output wireguard-dashboard.tar.gz
mkdir wireguard-dashboard
tar -xvzf wireguard-dashboard.tar.gz --strip-components=1 -C wireguard-dashboard
rm wireguard-dashboard.tar.gz
cd wireguard-dashboard
npm i

echo "[Unit]
Description=WireGuard-Dashboard autostart service
After=network.target

[Service]
WorkingDirectory=/home/wireguard-dashboard
ExecStart=/usr/bin/node /home/wireguard-dashboard/src/server.js

[Install]
Alias=wg-dashboard.service" > /etc/systemd/system/wg-dashboard.service
systemctl enable wg-dashboard
systemctl start wg-dashboard

ufw allow 22
ufw enable
ufw allow 3000

echo "Done! You can now connect to your dashboard at port 3000"
