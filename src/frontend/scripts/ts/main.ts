import { create_chat } from "./chat.ts";

const input: HTMLInputElement = 
    document.getElementById("new_chat") as HTMLInputElement
    || document.createElement('input');

const description: HTMLInputElement =
    document.getElementById("desc") as HTMLInputElement
    || document.createElement('input');

input.addEventListener("keydown", e =>
{
    if (e.key != "Enter") return
    //
    e.preventDefault();
    create_chat(input.value, description.value);
})