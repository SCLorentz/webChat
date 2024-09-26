# web chat

Version: 6.0.0_b

This is still been developed, so it has some bugs. I would appreciate if you want to contribute with the project

## Develop by your own

### My recomendations - Docker

If you want to develop your own version of this chat, you should get docker installed, so you don't have to worry about configure anything or make shure that this will work on your machine, is everythig already configured for you. Besides, in a virtualized environment, errors like "it works on my machine" can be avoidable. I made this to be really simple to just "enter and use" with no need for configuration. <!--fuck the history that was deleted because of him, how could he do that with me?-->

<img src="https://upload.wikimedia.org/wikipedia/commons/7/70/Docker_logo.png?20240428132226" alt="docker logo" width="300px"><br/>
<a href="https://commons.wikimedia.org/wiki/File:Docker_logo.png">Docker, Inc.</a>, <a href="http://www.apache.org/licenses/LICENSE-2.0">Apache License 2.0</a>, via Wikimedia Commons

### Start the server

To start the server, use: `run`, this command will make shure that everything necessary to make this project work is being executed and is working correctly.

## Commands

transpile *.info.pkl* into json: `pkl eval -f json .info.pkl`

`go mod tidy`

## Algumas ideias para usar na página

para transição de paginas ➜ view Transitions API

scroll ➜ animation-timeline

## Versions

V. 1.0.0 ➜ I rewrite the entire front-end with object orientation

V. 2.0.0 ➜ I added the back-end in nodeJS

V. 3.0.0 ➜ I change the runtime (Node --> Deno), language (JS --> TS) and framework (Express --> Oak) in the back-end

V. 4.0.0 ➜ WASM features in the front-end

V. 5.0.0 ➜ I rewrite the entire back-end from js to go without libraries
