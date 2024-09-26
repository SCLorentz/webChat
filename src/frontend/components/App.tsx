import React, { useEffect, useState } from 'react';

// Types
export type UUID = `${string}-${string}-${string}-${string}-${string}`;
export type Base64 = `data:image/${string};base64,${string}`;

export type Person = {
    id: UUID,
    name: string,
    img: Base64
}

export type Message = {
    id: UUID,
    content: string,
    sender: Person,
    timestamp: Date,
}

// Utility function
export function uuidv4(): UUID {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    }) as UUID;
}

// UserChat class
class UserChat {
    private id: UUID;
    private messages: Message[];
    public name: string;

    constructor(name: string) {
        this.id = uuidv4();
        this.name = name;
        this.messages = [];
    }

    private getMessages() {
        // TODO: Implement fetching messages from database
    }

    public create() {
        // TODO: Implement React component for user chat
    }
}

// Chat class
class Chat {
    private id: UUID;
    private messages: Map<UUID, Message>;
    public name: string;
    public people: Map<UUID, Person>;

    constructor(name: string, messages: Message[]) {
        this.id = uuidv4();
        this.name = name;
        this.people = new Map<UUID, Person>();
        this.messages = new Map<UUID, Message>();
        messages.forEach(msg => this.messages.set(msg.id, msg));
    }

    public addPeople = (people: Person[]) => new Promise((resolve, _) => {
        people.forEach(person => this.people.set(person.id, person));
        resolve(true);
    });

    public create() {
        // TODO: Implement React component for chat
    }

    public delete() {
        // TODO: Implement chat deletion
    }
}

// Main App component
const App: React.FC = () => {
    const [result, setResult] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [chat, setChat] = useState<Chat | null>(null);

    useEffect(() => {
        const loadWasm = async () => {
            try {
                const module = await import('../../../public/scripts/frontend/wasm_bg.wasm');
                const sum = module.add(5, 37);
                setResult(sum);
            } catch (err) {
                console.error('Erro ao carregar o módulo WASM:', err);
                setError('Módulo WASM não disponível. Verifique se o build foi realizado.');
            }
        };

        loadWasm();

        // Create a sample chat
        const newChat = new Chat("Sample Chat", []);
        setChat(newChat);
    }, []);

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">React + TypeScript + Tailwind + Rust WASM</h1>
            {error ? (
                <p className="text-red-500">{error}</p>
            ) : (
                <p>5 + 37 = {result !== null ? result : 'Calculando...'}</p>
            )}
            {chat && (
                <div>
                    <h2 className="text-xl font-semibold mt-4">Chat: {chat.name}</h2>
                    <p>Chat ID: {chat['id']}</p>
                    <p>Number of people: {chat.people.size}</p>
                </div>
            )}
        </div>
    );
};

export default App;
