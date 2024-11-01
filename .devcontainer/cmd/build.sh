apt-get update && apt-get install -y git gcc
cargo install wasm-pack

# Clear the existing .bashrc content
> ~/.bashrc

cat /bash >> ~/.bashrc

rm -rf /bash
rm -rf /setup.sh