// verify if the code is beeing runned localy or in a server
const is_local: () => Promise<boolean> = async () => {
    const url = new URL('/is_running', import.meta.url).href;
    try {
        await fetch(url);
        return true;
    } catch {
        return false;
    }
};

// @ts-ignore
// import files from diferent paths dependinf if the server is running or not
const wasmModule = await (is_local() ? import("../web/wasm.js") : import("/web/wasm.js"));
const { id, Message, Person } = wasmModule;
const init = wasmModule.default; // Atribui a exportação padrão a init

// update this method to be server / local in the future
import type { UUID, Base64 } from "./types.d.ts"
import { Chat, User } from "./chat.ts"

async function ID(): Promise<UUID> {
    // verify the existence of that id in the DB
    await init();
    return id() as UUID
}

async function run() {
    await init(); // Inicializa o módulo WASM

    // Cria uma instância de Person
    const Tina = new Person({
        id: await ID(), // Substitua por um UUID válido
        name: 'Tina',
        img: null
    });

    // Cria uma instância de Message
    const message = new Message({
        id: await ID(), // Substitua por um ID válido
        sender: Tina,
        timestamp: Date.now(),
        favorited: false,
        text: 'Hello, Tina!'
    });

    console.log(message);
}

// Chama a função run
run();