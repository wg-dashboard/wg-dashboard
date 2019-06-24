#!/bin/bash
set -ex

if [[ "$EUID" -ne 0 ]]; then
    echo "Sorry, this script must be ran as root"
	sudo curl https://raw.githubusercontent.com/team-centric-software/wireguard-dashboard/master/install_script.sh | bash
    exit
fi

# add wireguard repository to apt
add-apt-repository -y ppa:wireguard/wireguard
# install wireguard
apt-get install -y wireguard
# install linux kernel headers
apt-get install -y linux-headers-$(uname -r)
# enable ipv4 packet forwarding
sysctl -w net.ipv4.ip_forward=1
echo "net.ipv4.ip_forward=1" >> /etc/sysctl.conf
# install nodejs
curl https://deb.nodesource.com/setup_10.x | bash
apt-get install -y nodejs

# go into home folder
cd /opt
# delete wireguard-dashboard folder and wireguard-dashboard.tar.gz to make sure it does not exist
rm -rf wireguard-dashboard
rm -rf wireguard-dashboard.tar.gz
# download wireguard-dashboard latest release
curl -L https://github.com/$(wget https://github.com/team-centric-software/wireguard-dashboard/releases/latest -O - | egrep '/.*/.*/.*tar.gz' -o) --output wireguard-dashboard.tar.gz
# create directory for dashboard
mkdir wireguard-dashboard
# unzip wireguard-dashboard
tar -xzf wireguard-dashboard.tar.gz --strip-components=1 -C wireguard-dashboard
# delete unpacked .tar.gz
rm -f wireguard-dashboard.tar.gz
# go into wireguard-dashboard folder
cd wireguard-dashboard
# install node modules
npm i --production

# create service unit file
echo "[Unit]
Description=WireGuard-Dashboard autostart service
After=network.target

[Service]
Restart=always
WorkingDirectory=/opt/wireguard-dashboard
ExecStart=/usr/bin/node /opt/wireguard-dashboard/src/server.js" > /etc/systemd/system/wg-dashboard.service

# reload systemd unit files
systemctl daemon-reload
# start wg-dashboard service on reboot
systemctl enable wg-dashboard
# start wg-dashboard service
systemctl start wg-dashboard

# enable port 22 in firewall for ssh
ufw allow 22
# enable firewall
ufw --force enable
# enable port 58210 in firewall for wireguard
ufw allow 58210

echo ""
echo "=========================================================================="
echo ""
echo "Done! WireGuard and WireGuard-Dashboard have been successfully installed"
echo "You can now connect to the dashboard by visiting http://localhost:3000 via ssh tunnel"
echo "You can open an ssh tunnel from your local machine with this command: 'ssh -L 3000:localhost:3000 <your_vps_user>@<your_vps_ip>'"
echo "Please save this command for later, as you will need it to access the dashboard"
