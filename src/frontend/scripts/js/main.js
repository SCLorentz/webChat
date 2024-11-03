const input = document.getElementById("new_chat");
const description = document.getElementById("desc");
//
input.addEventListener("keydown", e => {
    if (e.key != "Enter") return
    //
    e.preventDefault();
    create(input.value, description.value);
})

const create = (name, desc) => fetch(`/new_chat?name=${name}&desc=${desc}`)
    .then(x => x.json())
    .then(y => response_handler(y))
    .then(z => console.log(z))
.catch(err => console.log(err))

function response_handler(y)
{
    const val = Object.values(y)[0];
    //
    if (val == "invalid arguments!") throw val
    //
    new Chat(y["name"], y["id"], y["desc"]).build()
    //
    return y
}

class Chat
{
    constructor(name, id, desc)
    {
        this.name = name;
        this.desc = desc;
        this.id = id;
    }
    
    build()
    {
        const base = document.createElement("div");
        document.body.appendChild(base);
        base.id = this.id;
        // title
        this.title = document.createElement("h1");
        this.title.innerText = this.name;
        base.appendChild(this.title);
        // desc
        this.title_desc = document.createElement("p");
        this.title_desc.innerText = this.desc;
        base.appendChild(this.title_desc);
    }
}