//import init, { uuid4 } from "/web/wasm.js";
import init, { id } from "../web/wasm.js";

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// start-up
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export type UUID = `${string}-${string}-${string}-${string}-${string}`;
export type Base64 = `data:image/${string};base64,${string}`;

// define Person type
export type Person = {
    id: UUID,
    name: string,
    img: Base64 | undefined
}

// define Message type
export type Message = {
    id: UUID,
    content: string,
    sender: Person,
    timestamp: number,
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// User Chat
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

class UserChat {
    // private fields
    private id: UUID;
    // this will contain olny preloaded messages that we think that the user will access frequently, normaly new messages or favorite ones
    private messages: Message[];
    // public fields
    public name: string;

    constructor(name: string) {
        this.name = name;
        // get messages from the database
        this.genID();
    }

    private async genID() {
        this.id = await ID();
    }

    // get messages from the database
    private getMessages() {
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

class Chat {
    // private fields
    private id: UUID;
    private messages: Map<UUID, Message>;
    // public fields
    public name: string;
    public people: Map<UUID, Person>;

    constructor(name: string) {
        // inicialization values
        this.name = name;
        // create a map for the people
        this.people = new Map<UUID, Person>();
        //
        this.genId()
    }

    private async genId() {
        this.id = await ID();
    }

    public addPeople = (people: Person[]) => new Promise((resolve, _) => {
        people.forEach(person => this.people.set(person.id, person));
        resolve(true);              // return the status of the operation
    });

    public async newMessage(content: string, person: Person) {
        const newMsg: Message = {
            //id: init().then(() => id()) as unknown as UUID,
            id: await ID(),
            content: content,
            sender: person,
            timestamp: Date.now(),  // Todo: compare with the server date as well
        }
        //
        this.messages.set(newMsg.id, newMsg)
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

async function ID(): Promise<UUID> {
    // verify the existence of that id in the DB
    await init();
    return id() as UUID
}

// Test
const Zéulo: Person = {
    id: await ID(),
    name: "Zéulo Rio Renno",
    img: undefined
},
Ana: Person = {
    id: await ID(),
    name: "Ana L.",
    img: undefined
}
//
const test = new Chat("my chat");
test.addPeople([Zéulo, Ana]);
//
console.log(test)