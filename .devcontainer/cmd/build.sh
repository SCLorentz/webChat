apt-get update && apt-get install -y git gcc

# Clear the existing .bashrc content
> ~/.bashrc

cat /bash >> ~/.bashrc

rm -rf /bash
rm -rf /setup.sh