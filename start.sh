# kill any running server
pkill deno
deno upgrade
# build WASM
echo building wasm...
echo ""
cargo install wasm-pack
wasm-pack build --target web --out-dir ./public/script

echo starting the server...
echo ""

deno task start

# adicionar metodo para abrir no browser fora do container