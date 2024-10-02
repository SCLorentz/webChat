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
    sender: Person,
    timestamp: number,
    favorited: boolean,
    // content
    binaries: undefined // this is where the file of the message will be inserted
    text: string,
}