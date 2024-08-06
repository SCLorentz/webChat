# kill any running server
# ...
# build WASM
echo building wasm...
echo ""
cargo install wasm-pack
wasm-pack build --target web --out-dir ./public/scripts/wasm

echo starting the server...
echo ""

go run .

# adicionar metodo para abrir no browser fora do container