///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// start-up
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export type UUID = `${string}-${string}-${string}-${string}-${string}`;
export type Base64 = `data:image/${string};base64,${string}`;

// define Person type
export type Person = {
    id: UUID,
    name: string,
    img: Base64
}

// define Message type
export type Message = {
    id: UUID,
    content: string,
    sender: Person,
    timestamp: Date,
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
        this.id = uuidv4();
        this.name = name;
        // get messages from the database
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

    constructor(name: string, messages: Message[]) {
        // inicialization values
        this.id = uuidv4();
        this.name = name;
        // create a map for the people
        this.people = new Map<UUID, Person>();
        this.messages = new Map<UUID, Message>();
    }

    public addPeople = (people: Person[]) => new Promise((resolve, _) => {
        people.forEach(person => this.people.set(person.id, person));
        resolve(true);          // return the status of the operation
    });

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

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// utils
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function uuidv4(): UUID {
    // this is used to generate uuids for new values, they will be stored in the database
    // Todo: use a better uuid generator that can verify if the uuid is already in the database
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, replace) as UUID;
    //
    function replace(c: string) {
        const r = Math.random() * 16 | 0;
        const v = c == 'x' ? r : (r & 0x3 | 0x8);
        //
        return v.toString(16);
    }
}

// Todo: use react to create a function resposable to generate the message bubble, that will be an SVG image