# build WASM
echo building wasm...
echo ""
wasm-pack build --target web --out-dir ./public/script

echo starting the server...
echo ""
deno task start