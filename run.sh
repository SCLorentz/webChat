# kill any running server
# ...
# build WASM
echo building wasm...
echo ""
cargo install wasm-pack
wasm-pack build --target web --out-dir ./public/scripts/wasm

# go build
echo "Building server..."
go build -o webchat

# server startup
echo "Starting server..."
./webchat

# adicionar metodo para abrir no browser fora do container
