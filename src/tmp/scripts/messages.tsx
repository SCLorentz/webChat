///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// message types
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

import { UUID, Person, Message, uuidv4 } from "./index.tsx";

// create a text type message class
export class TextMessage implements Message {
    id: UUID;
    content: string;
    sender: Person;
    timestamp: Date;

    constructor(content: string, sender: Person, timestamp: Date) {
        this.id = uuidv4();
        this.content = content;
        this.sender = sender;
        this.timestamp = timestamp;
    }

    // create a html text message
    load() {
        // use react here
    }
}

// create a image type message class
export class ImageMessage implements Message {
    id: UUID;
    content: string;
    sender: Person;
    timestamp: Date;

    constructor(content: string, sender: Person, timestamp: Date) {
        this.id = uuidv4(); // Todo: create a uuid for the message
        this.content = content;
        this.sender = sender;
        this.timestamp = timestamp;
    }

    // create a html image message
    load() {
        // use react here
    }
}