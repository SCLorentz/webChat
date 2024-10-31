// verify if the code is beeing runned localy or in a server
async function is_local(): Promise<boolean>
{
    const url = new URL('/is_running', import.meta.url).href;
    // this is so ugly...
    try {
        await fetch(url);
        console.log("running on server");
        return true;
    } catch {
        console.log("running localy");
        return false;
    }
};

// @ts-ignore
// import files from diferent paths dependinf if the server is running or not
const wasmModule = await (is_local() ? import("../web/wasm.js") : import("/web/wasm.js"));
const { id } = wasmModule;
const init = wasmModule.default; // Atribui a exportação padrão a init

// update this method to be server / local in the future
import type { Message, UUID, Person, Base64 } from "./.types"
import { Chat } from "./chat.ts"
import { User } from "./user.ts"

await init();

// Test
const Tina: Person = {
    id: await id(),
    name: "Tina",
    img: undefined
},
Malu: Person = {
    id: await id(),
    name: "Malu",
    img: undefined
}
//
const chat = new Chat("Prokopowitsch")
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