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
        "h": () => search.click(),
        "f": () => console.log("hello!")
    }
    actions[e.key]?.();
});

Element.prototype.hideOnClick = function () {
    // verify if the element isn't himself
    document.onclick = () => this.style.display = "none";
};

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
          settings = document.getElementById("settingsMenu");
    //
    function rotate(deg) {
        return function () { //o return em uma função me deu uma ideia para o server.ts
            configBtn.style.transform = `rotate(${deg})`;
        }
    }
    configBtn.addEventListener('mouseover', rotate('10deg'));
    configBtn.addEventListener('mouseleave', rotate('0deg'));
    // open settings menu
    configBtn.addEventListener('click', () => {
        if (creator.style.display == "grid") return
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
        if (creator.style.display == "grid") return
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
        document.getElementById('osTheme').style.background = "black";
    }
    //receber
    fetch('/get_data')
        .then(response => response.json()) // Converte a resposta em formato JSON
        .then(data => {
            //console.log(data)
            init().then(() => {
                for (const c of data.chats) {
                    chats.push(new chat(c[1], c[0], c[2], [user, alunos[1]], [user], true))
                }
            })
        })
        .catch(err => Error(err))
        // get last chat opened using the coockie 'lastChat', and set it to be open
        .finally(() => {
            if (!document.getElementById(localStorage.getItem('lastChat'))) return
            //
            element.style.display = 'grid'
        });
});

//criar chat
const nameInput = document.getElementById('nameInput');
document.getElementById('add').onclick = () => {
    creator.style.display = "grid";
    //
    nameInput.addEventListener("keydown", e => {
        const keyList = [13, 37, 39, 9, 116, 8];
        //
        if (nameInput.value.length > 20 && !keyList.includes(e.key) && nameInput.selectionStart == nameInput.selectionEnd) {
            e.preventDefault();
        }
    });
    nameInput.addEventListener("paste", e => {
        const clipboardData = e.clipboardData || window.Clipboard;
        if (clipboardData.getData("text").length + nameInput.value.length >= 17) throw Error("you can't paste more then the allowed size!")
        //
        e.preventDefault();
        //alert('texto muito grande, você só tem mais ' + (17 - nameInput.value.length) + ' caracteres até o limite');
    });
    nameInput.addEventListener('drop', e => e.preventDefault());
};
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
    }), () => {
        chats.push(new chat(id(), name, '/groupImg.svg', [user, alunos[1]], [user], true)); //obter ip gerado pelo DB
        nameInput.value = '';
    })
}

function saveData(data, then) {
    fetch('/save_data', {
        method: 'POST', // Método da requisição (pode ser GET, POST, PUT, DELETE, etc.)
        headers: {
            'Content-Type': 'application/json'
        },
        body: data
    }).then(response => response.json())
      .then(responseData => console.log(responseData))
      .catch(err => console.error(err))
      .finally(then);
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

export { saveData, readDataFile }