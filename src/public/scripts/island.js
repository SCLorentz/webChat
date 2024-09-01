// deno-lint-ignore-file no-window no-window-prefix prefer-const
//Aqui ficam todas as propriedades interativas da pagina (islands of interactivity)
import init, { id } from "/frontend/wasm.js";

console.log(document.cookie);

import { chat, chats, user, alunos } from '/main.js';
const search = document.getElementById('pesquisar'),
    creator = document.getElementById('newChatMenu');

/*if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('offline.js');
}*/ //offline

window.addEventListener("keydown", e => {
    if (!e.ctrlKey) return
    e.preventDefault();
    //
    const actions = {
        "s": () => document.getElementById('settings').click(),
        "g": () => document.getElementById('add').click(), 
        //"h": () => search.click(),    // pesquisa local no grupo
        "p": () => search.click(),      // pesquisa global
    }
    actions[e.key]?.();
});

Element.prototype.hideOnClick = function () {
    // verify if the element isn't himself
    document.onclick = () => this.style.display = "none";
};

// a better way to do this would be using QUERYs, example '/get_data?kind=chats'
// then the server would return just the data requested and not the whole json

async function getData(kind) {
    return fetch(`/get_data?kind=${kind}`)
    .then(response => response.json()) // Converte a resposta em formato JSON
    .then(data => {
        return data
    })
    .catch(err => Error(err))
}

getData("chats").then(data => console.log(data))

export default Object.defineProperty(Element.prototype, 'paste', {
    // for some reason there is a new bug with the paste event now, fix it later
    set: function(e, max) {
        const c = e.clipboardData || window.Clipboard,
            len = this.length,
            pasteLen = c.getData("text").length,
            cursorPos = this.selectionStart;

        // Calcula quantos caracteres podem ser colados
        const charsToPaste = Math.min((max + 1) - len, pasteLen);

        if (charsToPaste <= 0 || !pasteLen + this.value.length > max) throw Error("you can't paste more then the allowed size!");
        //
        e.preventDefault();
        // Obtém a parte do texto antes e depois do cursor
        const beforeText = this.value.substring(0, cursorPos),
            afterText = this.value.substring(cursorPos);

        // Concatena as partes, inserindo o texto colado no meio
        this.value = beforeText + c.getData("text").slice(0, charsToPaste) + afterText;
    }
});

document.addEventListener("DOMContentLoaded", () => {
    //PWA
    /*if ('windowControlsOverlay' in navigator) {}
    */
    //console.log(navigator.userAgentData.platform, ":", navigator.userAgentData.brands);
    //
    document.getElementById('sort').onclick = e => {
        e.stopPropagation();
        //
        const sortNav = document.getElementById('sortNav');
        sortNav.style.display = "flex";
        sortNav.hideOnClick();
    }
    //
    const configBtn = document.getElementById('settings'),
        settings = document.getElementById("settingsMenu"),
    //
    rotate = deg => {
        return () => configBtn.style.transform = `rotate(${deg})`;
    }
    configBtn.addEventListener('mouseover', rotate('10deg'));
    configBtn.addEventListener('mouseleave', rotate('0deg'));
    // open settings menu
    configBtn.addEventListener('click', () => {
        if (creator.style.display == "grid") return // fix this, since the creator works differnt now
        //
        settings.style.display = 'flex';
        requestAnimationFrame(() => settings.style.top = '0%');
    });
    // close settings menu
    document.getElementById('closeSettings').addEventListener('click', () => {
        settings.style.top = '100%';
        setTimeout(() => settings.style.display = 'none', 1000);
    });
    search.addEventListener('click', e => {
        if (creator.style.display == "grid") return // fix this, since the creator works differnt now
        //
        e.stopPropagation();
        const b = search.lastElementChild;
        //
        b.style.display = "block";
        b.focus();
        b.hideOnClick();
    })
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        // create a dark and light theme
        document.getElementById('osTheme').style.background = "black"; // remove this in the future, adding in the css
        document.body.classList.add('dark');
        // window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? document.body.classList.add('dark') : document.body.classList.remove('dark');
    }
    //receber
    /*fetch('/get_data')
        .then(response => response.json()) // Converte a resposta em formato JSON
        .then(data => init().then(() => {
            for (const c of data.chats) chats.push(new chat(c[1], c[0], c[2], [user, alunos[1]], [user], true))
        }))
        .catch(err => Error(err))
        // get last chat opened using the coockie 'lastChat', and set it to be open
        .finally(() => element.style.display = document.getElementById(localStorage.getItem('lastChat')) ? 'grid' : '');*/
});

//criar chat
const nameInput = document.getElementById('nameInput');
nameInput.addEventListener("keydown", e => {
    if (nameInput.value.length > 20 && ![13, 37, 39, 9, 116, 8].includes(e.key) && nameInput.selectionStart == nameInput.selectionEnd) e.preventDefault();
});
nameInput.addEventListener("paste", paste => nameInput.paste(paste, 20));
nameInput.addEventListener('drop', e => e.preventDefault());
//
document.getElementById('create').onclick = () => {
    const name = nameInput.value.replace(/^\W+/, '');
    //
    if (name == '' || name.length >= 20) throw Error("you can't create a group with an empty name!");
    //
    saveData(JSON.stringify({
        type: "CREATE",
        target: "chats",
        name: name,
        date: new Date()
    }))
    .then(response => {
        console.log(response)
        chats.push(new chat(id(), name, '/groupImg.svg', [user, alunos[1]], [user], true)); //obter id gerado pelo DB
    })
    .catch(err => { throw Error(err) })
    // this is temporary, is just beeing used while the server doesn't have a response method, creating a group anyway
    // review: maybe we can allow the user to create a chat without waiting for the server to respond and then, after the server responds, save it in the database
    // allowing the user to create chats without a internet connection
    .finally(() => {
        //creator.style.display = 'none'; // hide the creator, but don't change the display
        nameInput.value = '';
        chats.push(new chat(id(), name, '/groupImg.svg', [user, alunos[1]], [user], true));
    }) 
}

const saveData = data => {
    return new Promise((resolve, reject) => {
        fetch('/save_data', {
            method: 'POST', // Método da requisição (pode ser GET, POST, PUT, DELETE, etc.)
            headers: { 'Content-Type': 'application/json' },
            body: data
        })
        .then(response => response.json())
        .then(responseData => resolve(responseData))
        .catch(err => reject(err))
    })
}

// change this to read all types of files
const readDataFile = inputFile => {
    const tmp = new FileReader();
    //
    return new Promise((resolve, reject) => {
        tmp.onerror = () => {
            tmp.abort();
            reject(new DOMException("Problem parsing input file."));
        };
    
        tmp.onload = () => resolve(tmp.result);
        tmp.readAsDataURL(inputFile);
    });
};

// adicionar mais usos para o popup
const callPopup = msg => {
    const popup = document.getElementById('popup');
    //
    return new Promise((resolve, reject) => {
        popup.innerText = msg;
        popup.disp = "flex";
        popup.style.top = '0';
        popup.style.left = `calc(50% - ${popup.offsetWidth / 2}px)`;
        //
        setTimeout(() => transition(resolve, reject), 3000);
    })
    function transition(resolve, reject) {
        try {
            popup.style.top = '-20%';
            popup.addEventListener('transitionend', () => popup.disp = "")
            resolve();
        } catch (err) {
            popup.disp = "none";
            reject(err);
        }
    }
}

/*function applyCSS(css) {
    const styles = css.split("\n");
    console.log(styles);
}

applyCSS(`
    {
        color: var(--text-dark);
        position: fixed;
        z-index: 99;
    }
`);*/

export { saveData, readDataFile, callPopup }