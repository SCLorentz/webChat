# build WASM
echo building wasm...
echo ""
cargo install wasm-pack
wasm-pack build --target web --out-dir ./public/script

echo starting the server...
echo ""
deno task start

echo "opening http://localhost:8000 in your browser"
open http://localhost:8000