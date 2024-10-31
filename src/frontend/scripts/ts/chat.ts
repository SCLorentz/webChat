// merge the files when building the final JS one
//@ts-ignore
import * as zod from "https://deno.land/x/zod@v3.23.8/mod.ts";

import type { UUID, Person, Message } from "./.types"
import init, { id } from "../web/wasm.js";

await init();

const messageSchema = zod.object({
    text: zod.string()
});

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// chat class
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export interface Chat
{
    id: UUID;
    messages: Map<UUID, Message>;
    name: string;
    people: Map<UUID, Person>;
}

export class Chat implements Chat
{
    /* this is cool
    public static async inicialize(name: string) {
        const self = new Chat();
        // inicialization values
        self.name = name;
        self.people = new Map<UUID, Person>();
        self.id = await ID();
        //
        return self
    }*/

    constructor(name: string)
    {
        this.name = name;
        this.people = new Map<UUID, Person>();
        this.id = id() as UUID;
    }

    public add_people(people: Person[])
    {
        people.forEach(person => this.people.set(person.id, person));
    }

    public new_message = (text: string, person: Person) => global_message(text, person).then(msg => 
    {
        this.messages.set(msg.id, msg);
        return msg;
    })

    public get_messages_from_db()
    {
        // get from db
    }

    // create a html chat
    /*public create() {
        // create a div with the chat id
        const chat = document.createElement('div');
        chat.id = this.id;
        // Todo: use react here
    }*/

    public delete()
    {
        // delete the chat, this shoud be a promise that deletes the html element, remove's it from the database and the local storage
    }
}

// para prevenir o uso de uma biblioteca (zod) use WASM em "message_handler"
export async function global_message(text: string, sender: Person): Promise<Message> {
    messageSchema.parse({ text })
    //
    return {
        id: id() as UUID,
        sender: sender,
        timestamp: Date.now(),  // Todo: compare with the server date as well
        favorited: false,
        //binaries: undefined,
        text: text
    };
}

async function get_data_from_db() {
    // get this from wasm
}