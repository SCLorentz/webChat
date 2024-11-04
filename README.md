# web chat

Version: 6.5.0_a

## Develop by your own:

### My recomendations - Docker

If you want to develop your own version of this chat, you should get docker installed, so you don't have to worry about configure anything or make shure that this will work on your machine, is everythig already configured for you. Besides, in a virtualized environment, errors like "it works on my machine" can be avoidable. I made this to be really simple to just "enter and use" with no need for configuration. <!--fuck the history that was deleted because of him, how could he do that with me?-->

<img src="https://upload.wikimedia.org/wikipedia/commons/7/70/Docker_logo.png?20240428132226" alt="docker logo" width="300px"><br/>
<a href="https://commons.wikimedia.org/wiki/File:Docker_logo.png">Docker, Inc.</a>, <a href="http://www.apache.org/licenses/LICENSE-2.0">Apache License 2.0</a>, via Wikimedia Commons

### Start the server

To start the server, use: `run`, this command will make shure that everything necessary to make this project work is being executed and is working correctly.

tmp: deno run ./src/frontend/scripts/ts/main.ts

## Bundle RS to WASM and JS

cargo build --target wasm32-unknown-unknown --release --target-dir=./src/frontend/scripts/web <-- use this to create wasm

There are some problems with 'wasm-pack', don't use it

## Bundle TS to JS

**for now I will use js (again), cause the output file 'bundle.js' has over 76MB of size idk why**

deno run -A npm:create-vite@latest --template react-ts

deno compile --allow-read --allow-net --config tsconfig.json --output=./src/frontend/scripts/js/bundle.js ./src/frontend/scripts/ts/index.ts

- Compile all the TS files into one JS file
- Remove comments

## Run the server

GOARCH=386 GOOS=linux go build main.go