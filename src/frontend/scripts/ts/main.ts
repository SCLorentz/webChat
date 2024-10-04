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
const { id } = wasmModule;
const init = wasmModule.default; // Atribui a exportação padrão a init

// update this method to be server / local in the future
import type { Message, UUID, Person, Base64 } from "./types.d.ts"
import { Chat, User } from "./chat.ts"

async function ID(): Promise<UUID> {
    // verify the existence of that id in the DB
    await init();
    return id() as UUID
}

// Test
const Tina: Person = {
    id: await ID(),
    name: "Tina",
    img: undefined
},
Malu: Person = {
    id: await ID(),
    name: "Malu",
    img: undefined
}
//
const chat = await Chat.inicialize("Prokopowitsch")
chat.add_people([Tina, Malu]);
//
console.log(chat)

const user = new User(Malu);
user.new_message("hello world")
    .then(set => {
        set.favorited = true;
        return set;
    })
    .then(set => console.log(set))
    .catch(err => console.log(err))