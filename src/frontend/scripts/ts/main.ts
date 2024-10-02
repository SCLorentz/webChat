//import init, { uuid4 } from "/web/wasm.js";
import init, { id } from "../web/wasm.js"; // make possible to use this both for local tests and server ones
import type { Message, UUID, Person, Base64 } from "./types.d.ts"

async function ID(): Promise<UUID> {
    // verify the existence of that id in the DB
    await init();
    return id() as UUID
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// User Chat
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

interface User {
    id: UUID;
    messages: Map<UUID, Message>;
    name: string;
    person: Person;
}

class User implements User {

    constructor(person: Person) {
        this.name = person.name;
        this.id = person.id;
        this.person = person;
        //
        this.messages = new Map();
    }

    public new_message = (text: string) => global_message(text, this.person).then(msg => {
        this.messages.set(msg.id, msg);
        return msg;
    })

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

interface Chat {
    id: UUID;
    messages: Map<UUID, Message>;
    name: string;
    people: Map<UUID, Person>;
}

class Chat implements Chat {

    constructor(name: string) {
        // inicialization values
        this.name = name;
        // create a map for the people
        this.people = new Map<UUID, Person>();
        // set id
        async () => this.id = await ID();
    }

    public add_people = (people: Person[]) => new Promise((resolve, _) => {
        people.forEach(person => this.people.set(person.id, person));
        resolve(true);              // return the status of the operation
    });

    public new_message = (text: string, person: Person) => global_message(text, person).then(msg => {
        this.messages.set(msg.id, msg)
        return msg;
    })

    public get_messages_from_db() {
        // get from db
    }

    // create a html chat
    public create() {
        // create a div with the chat id
        const chat = document.createElement('div');
        chat.id = this.id;
        // Todo: use react here
    }

    public delete() {
        // delete the chat, this shoud be a promise that deletes the html element, remove's it from the database and the local storage
    }
}

const global_message = (text: string, sender: Person) => new Promise<Message>( async (resolve, reject) => {
    if (typeof text != "string") reject(new Error("this message doesn't contain a properly string!"));
    //
    const new_message: Message = {
        // info
        id: await ID(),
        sender: sender,
        timestamp: Date.now(),  // Todo: compare with the server date as well
        favorited: false,
        // content
        binaries: undefined,
        text: text
    }
    //
    try {
        resolve(new_message)
    } catch(err) {
        reject(new Error(`something went wrong! ${err}`));
    }
})

// Test
const Zéulo: Person = {
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
const chat = new Chat("Prokopowitsch");
chat.add_people([Zéulo, Malu]);
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