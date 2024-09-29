# dependencies
apt-get update && apt-get install -y wget unzip curl

# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --default-toolchain stable
. $HOME/.cargo/env
rustup default stable

# Install Deno
wget https://deno.land/x/install/install.sh
sh install.sh
rm install.sh

# Install Go
wget https://golang.org/dl/go1.21.3.linux-amd64.tar.gz
tar -C /usr/local -xzf go1.21.3.linux-amd64.tar.gz
rm go1.21.3.linux-amd64.tar.gz