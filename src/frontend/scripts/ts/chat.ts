import type { response } from "./.types.d.ts"

export const create_chat = (name: string, desc: string) => fetch(`/new_chat?name=${name}&desc=${desc}`)
    .then(x => x.json())
    .then(y => response_handler(y))
    .then(z => console.log(z))
.catch(err => console.log(err))

function response_handler(y: response): response
{
    const val = Object.values(y)[0];
    //
    if (val == "invalid arguments!") throw val
    // handle here
    return y
}