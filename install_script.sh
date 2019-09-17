#!/bin/bash
set -e

if [[ "$EUID" -ne 0 ]]; then
	echo "Sorry, this script must be ran as root"
	echo "Maybe try this:"
	echo "curl https://raw.githubusercontent.com/wg-dashboard/wg-dashboard/master/install_script.sh | sudo bash"
	exit
fi

# i = distributor id, s = short, gives us name of the os ("Ubuntu", "Raspbian", ...)
if [[ "$(lsb_release -is)" == "Raspbian" ]]; then
	# needed for new kernel
	apt-get update -y
	apt-get upgrade -y

	# install required build tools
	apt-get install -y raspberrypi-kernel-headers libmnl-dev libelf-dev build-essential ufw
	cd /opt
	# get the latest stable snapshot
	curl -L https://git.zx2c4.com/WireGuard/snapshot/WireGuard-0.0.20190601.tar.xz --output WireGuard.tar.xz
	# create directory
	mkdir -p WireGuard
	# unzip tarball
	tar xf WireGuard.tar.xz -C WireGuard --strip-components=1
	# delete tarball
	rm -f WireGuard.tar.xz
	# go into source folder
	cd WireGuard/src
	# build and install wireguard
	make
	make install
	# go back to home folder
	cd ~
elif [[ "$(lsb_release -is)" == "Ubuntu" ]]; then
	# needed for add-apt-repository
	apt-get install -y software-properties-common
	# add wireguard repository to apt
	add-apt-repository -y ppa:wireguard/wireguard
	# install wireguard
	apt-get install -y wireguard
	# install linux kernel headers
	apt-get install -y linux-headers-$(uname -r)
elif [[ "$(lsb_release -is)" == "Debian" ]]; then
	if [[ "$(lsb_release -rs)" -ge "10" ]]; then
		# add unstable list
		echo "deb http://deb.debian.org/debian/ unstable main" > /etc/apt/sources.list.d/unstable.list
		printf 'Package: *\nPin: release a=unstable\nPin-Priority: 90\n' > /etc/apt/preferences.d/limit-unstable
		# update repository
		apt update
		# install linux kernel headers
		apt-get install -y "linux-headers-$(uname -r)" ufw
		# install wireguard
		apt install -y wireguard
		# update again (needed because of the linux kernel headers)
		apt-get update && apt-get upgrade
	else
		echo "Sorry, your operating system is not supported"
		exit
	fi
else
	echo "Sorry, your operating system is not supported"
	exit
fi

# enable ipv4 packet forwarding
sysctl -w net.ipv4.ip_forward=1
echo "net.ipv4.ip_forward=1" >> /etc/sysctl.conf
# install nodejs
curl https://deb.nodesource.com/setup_10.x | bash
apt-get install -y nodejs

# go into home folder
cd /opt
# delete wg-dashboard folder and wg-dashboard.tar.gz to make sure it does not exist
rm -rf wg-dashboard
rm -rf wg-dashboard.tar.gz
# download wg-dashboard latest release
curl -L https://github.com/$(wget https://github.com/wg-dashboard/wg-dashboard/releases/latest -O - | egrep '/.*/.*/.*tar.gz' -o) --output wg-dashboard.tar.gz
# create directory for dashboard
mkdir -p wg-dashboard
# unzip wg-dashboard
tar -xzf wg-dashboard.tar.gz --strip-components=1 -C wg-dashboard
# delete unpacked .tar.gz
rm -f wg-dashboard.tar.gz
# go into wg-dashboard folder
cd wg-dashboard
# install node modules
npm i --production --unsafe-perm

# create service unit file
echo "[Unit]
Description=wg-dashboard service
After=network.target

[Service]
Restart=always
WorkingDirectory=/opt/wg-dashboard
ExecStart=/usr/bin/node /opt/wg-dashboard/src/server.js

[Install]
WantedBy=multi-user.target" > /etc/systemd/system/wg-dashboard.service

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
# enable port 53 in firewall for dns
ufw allow in on wg0 to any port 53

# make and enter coredns folder
mkdir -p /etc/coredns
cd /etc/coredns
if [[ "$(lsb_release -is)" == "Raspbian" ]]; then
	# download coredns
	curl -L https://github.com/coredns/coredns/releases/download/v1.5.1/coredns_1.5.1_linux_arm.tgz --output coredns.tgz
elif [[ "$(lsb_release -is)" == "Ubuntu" ]]; then
	# download coredns
	curl -L https://github.com/coredns/coredns/releases/download/v1.5.1/coredns_1.5.1_linux_amd64.tgz --output coredns.tgz
elif [[ "$(lsb_release -is)" == "Debian" ]]; then
	# download coredns
	curl -L https://github.com/coredns/coredns/releases/download/v1.5.1/coredns_1.5.1_linux_amd64.tgz --output coredns.tgz
fi
# unzip and delete tar
tar -xzf coredns.tgz
rm -f coredns.tgz
# move coredns to correct directory
mv coredns /usr/bin/coredns
# write default coredns config
echo ". {
	forward . tls://1.1.1.1 {
		tls_servername tls.cloudflare-dns.com
		health_check 10s
	}

	cache
	errors
}" > /etc/coredns/Corefile
# write autostart config
echo "
[Unit]
Description=CoreDNS DNS Server
Documentation=https://coredns.io/manual/toc/
After=network.target

[Service]
LimitNOFILE=8192
ExecStart=/usr/bin/coredns -conf /etc/coredns/Corefile -cpu 10%
Restart=on-failure

[Install]
WantedBy=multi-user.target" > /etc/systemd/system/coredns.service
# disable systemd-resolved from startup
systemctl disable systemd-resolved
# stop systemd-resolved service
systemctl stop systemd-resolved
# enable coredns on system start
systemctl enable coredns
# start coredns
systemctl start coredns


echo ""
echo ""
echo "=========================================================================="
echo ""
echo "> Done! WireGuard and wg-dashboard have been successfully installed"
echo "> You can now connect to the dashboard via ssh tunnel by visiting:"
echo ""
echo -e "\t\thttp://localhost:3000"
echo ""
echo "> You can open an ssh tunnel from your local machine with this command:"
echo ""
echo -e "\t\tssh -L 3000:localhost:3000 <your_vps_user>@<your_vps_ip>"
echo ""
echo "> Please save this command for later, as you will need it to access the dashboard"
echo ""
echo "=========================================================================="
echo ""
echo ""
