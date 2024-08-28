# kill any running server
# ...
# build WASM
echo building wasm...
echo ""
cargo install wasm-pack
wasm-pack build --target web --out-dir ./src/public/scripts/frontend

# tidy go, not working, fix this!
cd ./src/backend
go mod tidy

# go build
echo "Building server..."
GOOS=linux GOARCH=amd64 go build -o ./webchat ./main.go

# server startup
echo "Starting server..."
./webchat

# adicionar metodo para abrir no browser fora do container