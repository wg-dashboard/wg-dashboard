#!/bin/bash
set -e

if [[ "$EUID" -ne 0 ]]; then
	echo "Sorry, this script must be ran as root"
	echo "Maybe try this:"
	echo "curl https://raw.githubusercontent.com/wg-dashboard/wg-dashboard/master/update_script.sh | sudo bash"
	exit
fi

# go into home folder
cd /opt
# test for existing install
if [ ! -d wg-dashboard ]; then
	echo "You do not appear to have wg-dashboard installed."
	echo "Try running this instead:"
	echo "curl https://raw.githubusercontent.com/wg-dashboard/wg-dashboard/master/install_script.sh | sudo bash"
	exit
fi

# backup existing config
cp wg-dashboard/server_config.json wg-dashboard/server_config.bak
# download latest release
curl -L https://github.com/$(wget https://github.com/wg-dashboard/wg-dashboard/releases/latest -O - | egrep '/.*/.*/.*tar.gz' -o) --output wg-dashboard.tar.gz
# untar latest release into existing install
tar -xzf wg-dashboard.tar.gz --strip-components=1 -C wg-dashboard
# delete unpacked .tar.gz
rm -f wg-dashboard.tar.gz

# go into wg-dashboard folder
cd wg-dashboard
# install node modules
npm i --production --unsafe-perm
# restore config
mv server_config.bak server_config.json

# restart service
systemctl restart wg-dashboard
