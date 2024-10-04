// merge the files when building the final JS one

import type { UUID } from "./types.d.ts"
import init, { id, wasm_message, Person, Message } from "../web/wasm.js"; // Verifique se o caminho está correto

async function ID(): Promise<UUID> {
    // verify the existence of that id in the DB
    await init();
    return id() as UUID
}

// para prevenir o uso de uma biblioteca (zod) use WASM
async function global_message(text: string, sender: Person): Promise<Message> {
    await init();
    return wasm_message(text, sender)
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// User Chat
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export interface User {
    id: UUID;
    messages: Map<UUID, Message>;
    name: string;
    person: Person;
}

export class User implements User {

    constructor(person: Person) {
        //this.name = person.name;
        //this.id = person.id;
        this.person = person;
        //
        this.messages = new Map();
    }

    public new_message = async (text: string) => {
        console.log("init")
        const msg = await global_message(text, this.person);
        console.log("msg val: ", msg)
        //
        //this.messages.set(msg.id, msg);
    }

    // get messages from the database
    private get_messages_from_db() {
        // get messages from the database
    }

    // create a html user chat
    public create() {
        // use react here
    }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// chat class
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export interface Chat {
    id: UUID;
    messages: Map<UUID, Message>;
    name: string;
    people: Map<UUID, Person>;
}

export class Chat implements Chat {

    // this is the equivalent to 'constructor', but async
    public static async inicialize(name: string) {
        const self = new Chat();
        // inicialization values
        self.name = name;
        self.people = new Map<UUID, Person>();
        self.id = await ID();
        //
        return self
    }

    /*public add_people(people: Person[]) {
        people.forEach(person => this.people.set(person.id, person));
    }*/

    /*public new_message = (text: string, person: Person) => global_message(text, person).then(msg => {
        this.messages.set(msg.id, msg);
        return msg;
    })*/

    public get_messages_from_db() {
        // get from db
    }

    // create a html chat
    /*public create() {
        // create a div with the chat id
        const chat = document.createElement('div');
        chat.id = this.id;
        // Todo: use react here
    }*/

    public delete() {
        // delete the chat, this shoud be a promise that deletes the html element, remove's it from the database and the local storage
    }
}

const get_data_from_db = async () => {
    // get this from wasm
}