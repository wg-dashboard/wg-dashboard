#!/bin/bash

add-apt-repository -y ppa:wireguard/wireguard
apt-get install -y wireguard
apt-get install linux-headers-$(uname -r)
sysctl -w net.ipv4.ip_forward=1
echo "net.ipv4.ip_forward=1" >> /etc/sysctl.conf
curl https://deb.nodesource.com/setup_10.x | bash
apt-get install -y nodejs

ufw allow 22
ufw enable
ufw allow 3000
