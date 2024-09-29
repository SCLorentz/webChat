# build WASM
echo building wasm...
echo ""
wasm-bindgen target/wasm32-unknown-unknown/release/wasm.wasm --out-dir ./src/frontend/scripts/web --target web

cd ./src/backend
go mod tidy

# go build
echo "Building server..."
GOOS=linux GOARCH=amd64 go build -o ./server ./main.go

# server startup
echo "Starting server..."
./server