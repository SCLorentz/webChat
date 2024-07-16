// deno-lint-ignore-file no-window no-window-prefix prefer-const
//Aqui ficam todas as propriedades interativas da pagina (islands of interactivity)

import { chat, chats, user, alunos } from '/script/main.js';
const search = document.getElementById('pesquisar'),
      creator = document.getElementById('newChatMenu');

/*if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('offline.js');
}*/ //offline

window.addEventListener("keydown", e => {
    if (!e.ctrlKey) { return }
    e.preventDefault();
    //
    switch (e.key) {
        case 's':
            document.getElementById('settings').click();
            break
        case 'g':
            document.getElementById('add').click();
            break
        case 'h': //futuramente transformar em pesquisa por mensagens global, ou seja, proucura em todas as conversas
            search.click();
            break
    }
});

Element.prototype.hideOnClick = function () {
    document.onclick = () => this.style.display = "none";
};

document.addEventListener("DOMContentLoaded", () => {
    //PWA
    /*if ('windowControlsOverlay' in navigator) {}
    */
    console.log(navigator.userAgentData.platform, ":", navigator.userAgentData.brands);
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
        if (creator.style.display == "grid") { return }
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
        if (creator.style.display == "grid") { return }
        //
        e.stopPropagation();
        let b = search.lastElementChild;
        //
        b.style.display = "block";
        b.focus();
        b.hideOnClick();
    })
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.getElementById('osTheme').style.background = "black";
    }
    //receber
    fetch('/receber')
        .then(response => response.json()) // Converte a resposta em formato JSON
        .then(data => {
            //console.log(data)
            for (const c of data.chats) {
                chats.push(new chat(c[1], c[0], c[2], [user, alunos[1]], [user], true))
            }
        })
        .catch(error => console.error(error))
        // get last chat opened using the coockie 'lastChat', and set it to be open
        .finally(() => document.getElementById(localStorage.getItem('lastChat')).style.display = 'grid');
});

//criar chat
const nameInput = document.getElementById('nameInput');
document.getElementById('add').onclick = () => {
    creator.style.display = "grid";
    //
    nameInput.addEventListener("keydown", e => {
        if (nameInput.value.length > 20 && e.key !== "Backspace" && e.key !== 13 && e.key !== 37 && e.key !== 39 && e.key !== 9 && e.key !== 116 && nameInput.selectionStart == nameInput.selectionEnd) {
            e.preventDefault();
        }
    });
    nameInput.addEventListener("paste", e => {
        const clipboardData = e.clipboardData || window.Clipboard;
        if (clipboardData.getData("text").length + nameInput.value.length < 17) { return }
        //
        e.preventDefault();
        alert('texto muito grande, você só tem mais ' + (17 - nameInput.value.length) + ' caracteres até o limite');
    });
    nameInput.addEventListener('drop', e => e.preventDefault());
};
document.getElementById('create').onclick = () => {
    const name = nameInput.value.replace(/^\W+/, '');
    if (name.value != '' && name.length < 20) {
        fetch('/enviar', {
            method: 'POST', // Método da requisição (pode ser GET, POST, PUT, DELETE, etc.)
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type: "CREATE",
                target: "chats",
                name: name,
                date: new Date()
            })
        })
            .then(response => response.json())
            .then(responseData => {
                console.log(responseData);
            })
            .catch(error => console.error(error))
            .finally(() => {
                chats.push(new chat(Math.random(), name, '/img/groupImg.svg', [user, alunos[1]], [user], true)); //obter ip gerado pelo DB
                nameInput.value = '';
            });
    }
}