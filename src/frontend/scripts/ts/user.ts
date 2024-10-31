///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// User Chat
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

import init, { id } from "../web/wasm.js";
import type { UUID, Person, Message } from "./.types"
import { global_message } from "./chat.ts";

await init();

export interface User
{
    id: UUID;
    messages: Map<UUID, Message>;
    name: string;
    person: Person;
}

export class User implements User
{
    constructor(person: Person)
    {
        this.name = person.name;
        this.id = person.id;
        this.person = person;
        //
        this.messages = new Map();
    }

    public new_message = (text: string) => global_message(text, this.person).then(msg =>
    {
        this.messages.set(msg.id, msg);
        return msg;
    })

    // get messages from the database
    private get_messages_from_db()
    {
        // get messages from the database
    }

    // create a html user chat
    public create()
    {
        // use react here
    }
}