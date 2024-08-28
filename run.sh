# kill any running server
# ...
# build WASM
echo building wasm...
echo ""
cargo install wasm-pack
wasm-pack build --target web --out-dir ./src/public/scripts/frontend

# go build
echo "Building server..."
GOOS=linux GOARCH=amd64 go build -o ./src/webchat ./src/server.go

# server startup
echo "Starting server..."
./src/webchat

# adicionar metodo para abrir no browser fora do container