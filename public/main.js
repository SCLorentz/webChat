window.addEventListener("keydown", function (e) {
    switch (e.ctrlKey && e.key) {
        case 's':
            e.preventDefault();
            document.getElementById('settings').click();
            break;
        case 'g':
            e.preventDefault();
            document.getElementById('add').click();
            break;
        case 'h': //futuramente transformar em pesquisa por mensagens global, ou seja, proucura em todas as conversas
            e.preventDefault();
            document.getElementById('pesquisar').focus();
            break;
    }
});
const chats = [];
document.addEventListener("DOMContentLoaded", () => {
    const configBtn = document.getElementById('settings');
    const settings = document.getElementById("settingsMenu");
    function rotateButton(deg) {
        return function () {
            configBtn.style.transform = `rotate(${deg})`;
        }
    }
    configBtn.addEventListener('mouseover', rotateButton('10deg'));
    configBtn.addEventListener('mouseleave', rotateButton('0deg'));
    configBtn.addEventListener('click', () => {
        settings.style.display = 'flex';
        requestAnimationFrame(() => settings.style.top = '0%');
    });
    document.getElementById('closeSettings').addEventListener('click', () => {
        settings.style.top = '100%';
        setTimeout(() => settings.style.display = 'none', 1000);
    });
    //
    /*fetch('/enviar-dados', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    })
        .then(response => response.json())
        .then(dados => {
            dados.forEach(dado => {
                chats.push(new chat(dado.id, dado.name, '/img/newGroupImg.svg', dado.guests, dado.adm, false));
            })
        })
        .catch(error => console.error('Erro ao enviar os dados:', error));*/
});
class Obj {
    constructor(type, customClass, father, innerText) {
        this.customClass = customClass;
        this.father = father;
        this.elementType = type;
        this.text = innerText;
        this._element = document.createElement(this.elementType);
        this._element.classList.add(...this.customClass);
        if (type == 'button') this._element.tabIndex = '0';
        this.father.appendChild(this._element);
        if (innerText) this._element.innerText = this._element.placeholder = this._element.alt = this.text;
        return this._element;
    }
}
//obter informações do aluno atravez de um banco de dados server-side.
const alunos = []; // Banco de dados de alunos
for (let i = 0; i < 8; i++) {
    const aluno = {
        nome: 'nome' + i,
        sobrenome: 'sobrenome' + i,
        img: 'img/user.svg',
        email: 'nome.sobrenome@colegiodante.org.br',
        id: 1 + i,
    };
    alunos.push(aluno);
}

const userName = decodeURIComponent(window.location.hash.slice(1)).split(" ")
const user = { nome: userName[0], sobrenome: userName[1], img: 'img/user.svg', email: `${userName[0]}.${userName[1]}@colegiodante.org.br` }

const popup = document.getElementById('popup');

class chat {
    constructor(id, name, thumb, guests, adm, gen = false) {
        this.gen = gen;
        this.id = id;
        this.name = name;
        this.thumb = thumb;
        this.guests = guests;
        this.bannedWords = null;
        this.adm = adm;
        this.createChat();
        this.createChatConfigs();
        this.createThumb();
        this.createMsg();
        this.msgs = [];
        if (this.gen) {
            //salvar dados do grupo
        }
        //obter palavras banidas do grupo e globais
    }
    createChat() {
        this.chatElement = new Obj('div', ['chat', 'chatMenu'], document.body);
        this.chatElement.id = this.id;
        //this.chatElement.addEventListener('contextmenu', e => e.preventDefault());
        this.thumbDiv = new Obj('div', ['thumbDiv'], this.chatElement);
        this.arrowBack = new Obj('button', ['arrowBack', 'material-icons-outlined'], this.thumbDiv, "arrow_back_ios"); //mobile
        //thumbPicture
        this.thumbPicture = new Obj('img', ['thumbPicture', 'chatImg'], this.thumbDiv);
        this.thumbPicture.src = this.thumb;
        this.thumbDiv.innerHTML += this.name;
        this.thumbPicture = this.thumbDiv.children[1];
        //
        Array.from(document.getElementsByClassName('arrowBack')).forEach(e => {
            if (window.innerWidth <= 850) {
                e.style.display = 'flex';
            }
        })
        window.addEventListener('resize', () => {
            if (window.innerWidth >= 850 && document.getElementById('salvos').style.display == 'none') {
                document.getElementById('salvos').style.display = 'grid'
            }
            Array.from(document.getElementsByClassName('arrowBack')).forEach(e => {
                e.style.display = (window.innerWidth <= 850) ? 'flex' : '';
                e.onclick = () => {
                    document.getElementById('salvos').style.display = 'grid'
                }
            })
        })
        //pesquisar
        this.searchBtn = new Obj('span', ['searchOnGroupBtn', 'material-icons-outlined'], this.thumbDiv, 'search');
        this.searchInput = new Obj('input', ['searchOnGroupInput'], this.searchBtn, 'pesquisar...');
        //search action
        this.searchBtn.onclick = () => {
            this.searchInput.style.width = this.thumbDiv.offsetWidth / 6 + 'px';
            this.searchInput.focus();
            document.onclick = () =>
                this.searchInput.style.width = (
                    document.activeElement !== this.searchInput && this.searchInput.value == ''
                ) ? null : this.thumbDiv.offsetWidth / 5 + 'px';
        }
        this.searchInput.addEventListener('keydown', e => {
            if (e.key == 'Enter') {
                e.preventDefault();
                this.msgs.forEach(msg => {
                    if (msg.content) {
                        //verificar se o input !== '' && conteudo da mensagem ~=(70%) input
                        msg.getMessage.style.display = (
                            [...msg.content].filter((char, index) => char == this.searchInput.value.charAt(index)).length / msg.content.length < 0.7 && this.searchInput.value !== ''
                        ) ? 'none' : 'block';
                    }
                })
            }
        })
        //video call
        this.call = new Obj('button', ['videoCam', 'material-icons-outlined'], this.thumbDiv, 'videocam');
        this.call.onclick = () => {
            window.open('/call')
        }
        this.imageOpened = new Obj('div', ['imageOpened'], this.chatElement);
        new Obj('button', ['material-icons-outlined'], this.imageOpened, 'close').style.height = 'fit-content';
    }
    createChatConfigs() {
        this.openConfig = new Obj('button', ['groupInfo', 'material-icons-outlined'], this.thumbDiv, "more_vert");
        this.chatConfig = new Obj('div', ['chatConfigs', 'chatMenu'], document.body);
        this.back = new Obj('button', ['material-icons-outlined', 'back'], this.chatConfig, 'arrow_back_ios')
        this.back.onclick = () => config(false, this);
        this.openConfig.onclick = () => config(true, this);
        function config(view, e) {
            e.chatConfig.style.display = (view) ? 'grid' : 'none';
            e.chatElement.style.display = (view) ? 'none' : 'grid';
        }
        this.editGroup();
        this.createGuestList();
    }
    createThumb() {
        const contatosMenu = document.getElementById('contatos');
        this.groupThumbBtn = new Obj('button', ['groupThumbBtn'], contatosMenu, this.name);
        //
        this.thumbBtnImg = new Obj('img', ['chatImg'], this.groupThumbBtn, this.name);
        this.thumbBtnImg.src = this.thumb;
        //
        this.groupThumbBtn.onclick = () => {
            document.querySelectorAll('.chat, .chatConfigs, .picMenu, .newGuestMenu').forEach(e => e.style.display = 'none');
            this.chatElement.style.display = 'grid';
            //thumb
            document.querySelectorAll('.groupThumbBtn').forEach(e => e.style.background = '');
            this.groupThumbBtn.style.background = '#0000002b';
            if (window.innerWidth <= 850) {
                document.getElementById('salvos').style.display = 'none'
            }
        }
        contatosMenu.scrollTop = contatosMenu.scrollHeight;
    }
    guestListFunction() {
        document.querySelectorAll('.guestInList, .addGuest').forEach(e => {
            if (e.parentNode == this.guestList) e.parentNode.removeChild(e)
        })
        this.addGuest = new Obj('button', ['material-icons-outlined', 'addGuest'], this.guestList, 'person_add');
        this.addGuest.onclick = () => this.newGuestMenu.style.display = 'flex';
        this.guests.forEach(guest => {
            const guestInList = new Obj('div', ['guestInList'], this.guestList, guest.nome + ' ' + guest.sobrenome);
            guestInList.addEventListener('contextmenu', e => {
                e.preventDefault();
                guestInfoMenu.style.display = 'flex';
                guestInList.addEventListener('mouseleave', () => {
                    guestInfoMenu.style.display = 'none';
                });
            });
            const guestInfoMenu = new Obj('div', ['guestInfoMenu'], guestInList);
            new Obj('img', [], new Obj('a', [], guestInfoMenu, `${guest.nome} ${guest.sobrenome}`)).src = guest.img;
            //email
            this.guestEmail = new Obj('p', [], guestInfoMenu, guest.email);
            this.guestEmail.title = 'copy';
            this.guestEmail.onclick = () => {
                try {
                    navigator.clipboard.writeText(guest.email);
                } catch (err) {
                    console.error('Erro ao copiar texto: ', err);
                }
            }
            const guestInListImg = new Obj('img', [], guestInList);
            guestInListImg.src = guest.img;
            //remove guest
            const removeGuest = new Obj('p', ['removeGuest'], guestInfoMenu, "x");
            removeGuest.onclick = () => {
                if (user == guest && confirm('deseja sair do grupo?')) {
                    guestInList.parentNode.removeChild(guestInList);
                    removeGuestFunc(guest, this)
                } else if (user != guest && confirm('deseja remover ' + guest.nome + ' do grupo?')) {
                    guestInList.parentNode.removeChild(guestInList);
                    removeGuestFunc(guest, this)
                }
            }
            function removeGuestFunc(g, c) {
                c.guests.splice(c.guests.indexOf(g), 1); //preciso adicionar o usuario removido para "add guests"
                if (c.adm.indexOf(g) != -1) {
                    c.adm.splice(c.adm.indexOf(g), 1);
                }
            }
            const toAdm = new Obj('p', ['tornarAdm'], guestInfoMenu);
            toAdm.innerText = (this.adm.includes(guest)) ? 'remove adm' : 'add adm';
            toAdm.onclick = () => {
                if (this.adm.includes(user)) {
                    if (this.adm.includes(guest)) this.adm.splice(this.adm.indexOf(guest), 1);
                    else this.adm.push(guest);
                    toAdm.innerText = (this.adm.includes(guest)) ? 'remove adm' : 'add adm';
                }
            }
        })
    }
    createGuestList() {
        this.guestList = new Obj('div', ['guestList'], this.chatConfig)
        this.guestList.innerHTML = '<h3 id="titleGuests">guests</h3>';
        this.guestListFunction()
        //guestList add btn
        this.newGuestMenu = new Obj('div', ['newGuestMenu'], this.chatConfig);
        this.closeNewGuestMenu = new Obj('button', ['closeBtn', 'material-icons-outlined'], this.newGuestMenu, 'close');
        this.closeNewGuestMenu.onclick = () => {
            this.newGuestMenu.style.display = 'none';
        }
        this.addNewGuestTitle = new Obj('h2', [], this.newGuestMenu, 'add guests');
        //add
        this.guestsToAdd = new Obj('div', ['guestsToAdd'], this.newGuestMenu);
        alunos.forEach(aluno => {
            if (!this.guests.includes(aluno)) {
                const add = new Obj('button', [], this.guestsToAdd, `${aluno.nome} ${aluno.sobrenome}`);
                const img = new Obj('img', ['addUserImg'], add);
                img.src = aluno.img;
                add.onclick = () => {
                    this.guests.push(aluno);
                    add.parentNode.removeChild(add);
                    this.guestListFunction() //corrigir bugs
                    fetch('/enviar-dados', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    })
                        .then(response => response.json())
                        .then(dados => {
                            const objetoEncontrado = dados.find(objeto => objeto.id === this.id);
                            if (objetoEncontrado) {
                                fetch('/add-guest', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({ id: this.id, guest: aluno }),
                                })
                                    .then(response => response.text())
                                    .then(message => console.log(message))
                                    .catch(error => console.error('Erro ao enviar dados:', error));
                            } else {
                                console.error("Objeto não encontrado com o ID fornecido.");
                            }
                        })
                        .catch(error => console.error('Erro ao enviar os dados:', error));
                }
            }
        })
    }
    editGroup() {
        //edit group img
        this.img = new Obj('img', ['GroupImg', 'chatImg'], this.chatConfig);
        this.img.src = this.thumb;
        //
        this.imgInput = document.createElement('input');
        this.imgInput.type = 'file';
        this.imgInput.accept = "image/svg+xml";
        this.imgInput.style.display = 'none';
        this.chatConfig.appendChild(this.imgInput);
        //this.picMenuOff.element.addEventListener('click',()=> this.picMenuOff.element.style.display = "none");
        this.picMenu = new Obj('div', ['picMenu'], this.chatConfig);
        this.buttonConfigs = [
            { name: 'picMenuUpload', ico: 'upload' },
            { name: 'picMenuCam', ico: 'photo_camera' },
            { name: 'picMenuNew', ico: 'add' },
            { name: 'picMenuEdit', ico: 'edit' },
            { name: 'picMenuDel', ico: 'delete' }
        ];
        this.buttonConfigs.forEach(btn => {
            this[btn.name] = new Obj('button', ['picMenuBtn', 'material-icons-round'], this.picMenu, btn.ico);
        });
        document.addEventListener('click', e => {
            e.stopPropagation();
            if (!this.picMenu.contains(e.target) && e.target !== this.picMenu && e.target !== this.img && this.picMenu.style.display === 'flex') {
                this.picMenu.style.display = 'none';
            }
        })
        this.img.addEventListener('click', () => {
            this.picMenu.style.display = "flex";
            this.picMenu.style.top = `calc(50% - ${this.picMenu.offsetHeight / 2}px)`;
            this.picMenu.style.left = `calc(50% - ${this.picMenu.offsetWidth / 2}px)`;
            //comando para fechar o menu
        });
        //foto
        this.capture = new Obj('video', ['picMenuVidCap'], this.picMenu);
        this.capture.autoplay = true;
        this.CaptureBtn = new Obj('button', ['vidCapBtn', 'picMenuVidCap', 'material-icons-outlined'], this.picMenu, "add_a_photo");
        this.picMenuCanvas = new Obj('canvas', ['picMenuCanvas'], this.picMenu);
        this.picMenuCanvas.height = "300";
        this.picMenuCanvas.width = "400";
        this.picMenuCam.addEventListener('click', () => {
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                navigator.mediaDevices.getUserMedia({ video: true })
                    .then(stream => {
                        Array.from(document.getElementsByClassName('picMenuVidCap')).forEach(e => e.style.display = "flex");
                        this.capture.srcObject = stream;
                        Array.from(document.getElementsByClassName('picMenuBtn')).forEach(e => e.style.display = "none");
                        this.picMenu.style.top = `calc(50% - ${this.picMenu.offsetHeight / 2}px)`;
                        this.picMenu.style.left = `calc(50% - ${this.picMenu.offsetWidth / 2}px)`;
                    })
                    .catch(error => console.error("Erro ao acessar a câmera: ", error));
            }
            this.CaptureBtn.addEventListener('click', () => {
                this.picMenuCanvas.getContext('2d').drawImage(this.capture, 0, 0, 400, 300);
                this.picMenuCanvas.style.display = 'flex';
                this.capture.style.display = "none";
                this.CaptureBtn.innerText = "replay";
                //
                this.thumb = this.picMenuCanvas.toDataURL('image/png');
                changeImg(this)
            })
        });
        //Dos arquivos
        this.picMenuUpload.onclick = () => this.imgInput.click();
        this.imgInput.addEventListener('change', e => {
            if (e.target.files[0].type.startsWith('image/svg+xml')) {
                const reader = new FileReader();
                reader.readAsDataURL(e.target.files[0]);
                reader.onload = () => {
                    this.thumb = reader.result;
                    //transformar em uma div para incorporar o svg diretamente na pagina, copiar conteudo do arquivo e colar dentro da div
                    changeImg(this);
                }
            } else alert('não é uma imagem tipo svg');
            this.picMenu.style.display = "none";
        })
        function changeImg(c) {
            c.thumbBtnImg.src = c.img.src = c.thumbPicture.src = c.thumb;
        }
        //Criar editor svg com animações pre-definidas e por script
        //rename group
        this.rename = new Obj('textarea', ['renameGroup'], this.chatConfig, 'rename');
        this.rename.spellcheck = false;
        this.rename.value = this.name;
        this.rename.addEventListener("paste", e => {
            const clipboardData = e.clipboardData || window.Clipboard;
            if (clipboardData.getData("text").length + this.rename.value.length > 17) {
                e.preventDefault();
                alert('texto muito grande, você só tem mais ' + (17 - this.rename.value.length) + ' caracteres até o limite');
            }
        });
        this.rename.addEventListener("keydown", e => {
            if (this.rename.value.length > 16 && e.key !== "Backspace" && e.key !== 13 && e.key !== 37 && e.key !== 39 && e.key !== 9 && e.key !== 116 && this.rename.selectionStart == this.rename.selectionEnd) {
                e.preventDefault();
            }
            if (e.key == "Enter") {
                e.preventDefault();
                if (this.rename.value.replace(/^\W+/, '') !== '') this.renameGroup();
            }
        });
        this.rename.onblur = () => {
            if (this.rename.value.replace(/^\W+/, '') !== '' && this.rename.value != this.name) this.renameGroup();
            else this.rename.value = this.name;
        }
        this.rename.addEventListener('drop', e => e.preventDefault());
        this.desc = new Obj('input', ['groupDesc'], this.chatConfig, 'description')
        //del group
        this.delete = new Obj('button', ['deleteGroup', 'material-icons-round'], this.chatConfig, 'delete');
        this.delete.title = 'burn everything';
        this.delete.onclick = () => {
            if (confirm("deseja apagar este grupo?")) {
                this.chatElement.parentNode.removeChild(this.chatElement);
                this.chatConfig.parentNode.removeChild(this.chatConfig);
                this.groupThumbBtn.parentNode.removeChild(this.groupThumbBtn);
                chats.splice(this.id - 1, 1);
            }
        }
    }
    renameGroup() {
        this.thumbDiv.childNodes[2].nodeValue = this.groupThumbBtn.firstChild.nodeValue = this.name = this.rename.value;
        this.rename.value = this.rename.value.replace(/^\W+/, '');
        //
        fetch('/enviar-dados', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then(response => response.json())
            .then(dados => {
                const objetoEncontrado = dados.find(objeto => objeto.id === this.id);
                if (objetoEncontrado) {
                    fetch('/modificar-nome', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ id: this.id, novoNome: this.rename.value }),
                    })
                        .then(response => response.text())
                        .then(message => console.log(message))
                        .catch(error => console.error('Erro ao enviar dados:', error));
                } else {
                    console.error("Objeto não encontrado com o ID fornecido.");
                }
            })
            .catch(error => console.error('Erro ao enviar os dados:', error));
        //corrigir bugs de renomeio muito rapido (0.3sec), aplicar delay para mostrar o pop-up
        //mudar a mensagem do pop-up caso haja um erro como "erro ao enviar os dados"
        popup.innerText = "Grupo Renomeado!";
        popup.style.display = "flex";
        popup.style.top = '0%';
        popup.style.left = `calc(50% - ${popup.offsetWidth / 2}px)`;
        setTimeout(() => {
            popup.style.top = '-20%';
            popup.addEventListener('transitionend', () => {
                popup.style.display = "";
            })
        }, 3000)
    }
    createMsg() {
        this.msgArea = new Obj('div', ['msgArea'], this.chatElement);
        //scroll to the bottom
        this.scrollToTheBottom = new Obj('span', ['scrollToTheBottom', 'material-icons-round'], this.msgArea, 'arrow_downward');
        this.msgArea.onscroll = () => this.scrollToTheBottom.style.display = (this.msgArea.scrollTop < this.msgArea.scrollHeight - 800) ? "block" : "none";
        this.scrollToTheBottom.onclick = () => this.msgArea.scrollTop = this.msgArea.scrollHeight;
        //file preview
        this.inputChat = new Obj('div', ['inputChat'], this.chatElement);
        this.previewSlides = new Obj('div', ['previewSlides'], this.inputChat);
        this.previewArrowBackward = new Obj('button', ['material-icons-outlined', 'previewArrow'], this.inputChat, 'arrow_back_ios_new');
        this.previewArrowFoward = new Obj('button', ['material-icons-outlined', 'previewArrow'], this.inputChat, 'arrow_forward_ios');
        this.previewArrowFoward.style.left = '95%';
        //msgBallon
        //adicionar corretor automatico e sujestão de palavras
        //Ao começar a digitar, primeira letra em maiusculo (exeto quando o shift está ativado)
        //adicionar opção de gravar audio
        //adicionar menu de emojis
        this.msgBalloon = new Obj('textarea', ['msgBalloon'], this.inputChat);
        this.msgBalloon.placeholder = 'vontade de falar...';
        //audio recorder
        //gravação de audio
        //recursos de legendas para quem não puder ouvir o audio
        this.inputAudio = new Obj('span', ['material-icons-outlined', 'inputAudio'], this.inputChat, 'mic')
        let transferfiles = [];
        this.msgBalloon.addEventListener('drop', e => { //drop não funciona em this.msgArea, pesquisar o motivo e corrigir
            e.preventDefault();
            if (e.dataTransfer.files.length > 1) {
                this.previewArrowFoward.style.display = 'inline';
                this.previewArrowBackward.style.display = 'inline';
                this.previewArrowFoward.addEventListener('click', () => changeSlide(i + 1, this.previewSlides));
                this.previewArrowBackward.addEventListener('click', () => changeSlide(i - 1, this.previewSlides));
            }
            for (const dataFile of e.dataTransfer.files) {
                const reader = new FileReader();
                reader.readAsDataURL(dataFile);
                reader.onload = e => {
                    if (dataFile.type.startsWith('image/')) {
                        this.preview = new Obj('img', [], this.previewSlides);
                        this.preview.dataset.src = e.target.result;
                        this.preview.classList.add('lazyload');
                    } else if (dataFile.type.startsWith('audio/')) {
                        this.preview = new Obj('audio', [], this.previewSlides);
                        this.preview.load();
                        this.preview.src = e.target.result;
                    } else if (dataFile.type.startsWith('video/')) {
                        this.preview = new Obj('video', [], this.previewSlides);
                        this.preview.load();
                        this.preview.src = e.target.result;
                    }
                    this.preview.style.display = 'none';
                    this.previewSlides.style.display = 'flex';
                    this.previewSlides.childNodes[0].style.display = 'block';
                    this.preview.controls = true;
                    transferfiles.push(this.preview)
                }
            }
            let i = 0;
            function changeSlide(index, e) {
                if (index < e.childNodes.length && index >= 0) {
                    if (e.childNodes[i].nodeName == 'VIDEO' || e.childNodes[i].nodeName == 'AUDIO') {
                        e.childNodes[i].pause();
                    }
                    e.childNodes[i].style.display = 'none';
                    i = index;
                    e.childNodes[i].style.display = 'block';
                }
            }
        });
        let keys = {};
        this.msgBalloon.addEventListener('keydown', e => {
            keys[e.key] = true;
            if (keys['Enter'] && !keys['Shift']) {
                e.preventDefault();
                if (this.msgBalloon.value.replace(/^\s+/, "").replace(/[\u200E\s⠀ㅤ]/g, "") !== '') {
                    if (transferfiles.length > 0) {
                        this.preview.parentNode.removeChild(this.preview);
                        this.inputChat.style.height = '';
                        this.previewSlides.style.display = '';
                        this.msgs.push(new msg(this.msgBalloon.value, transferfiles, new Date(), user, this));
                        transferfiles = [];
                    } else {
                        this.msgs.push(new msg(this.msgBalloon.value, null, new Date(), user, this));
                    }
                }
            }
        });
        this.msgBalloon.addEventListener('keyup', e => keys[e.key] = false);
        this.msgBalloon.addEventListener('paste', e => {
            for (const item of e.clipboardData.items) {
                if (item.type.indexOf('image/') !== -1) {
                    this.msgs.push(new msg(this.msgBalloon.value, item.getAsFile(), new Date(), user, this));
                }
            }
        });
    }
}
//criar chat
const groupCreator = document.getElementById('newChatMenu');
const nameInput = document.getElementById('nameInput');
document.getElementById('add').onclick = () => {
    //criar um sistema para organizar os grupos (de forma a ser configurado pelo usuario):
    //nome (a-z)/ data de criação / mais acessados / não lidas / personalizado (os grupos não são organizados automaticamente e ganham a propriedade de serem arrastaveis)
    //adicionar context menu: fixar / marcar não lida / silenciar
    groupCreator.style.display = 'grid';
    groupCreator.style.left = `calc(50% - ${groupCreator.offsetWidth / 2}px)`;
    //
    nameInput.addEventListener("keydown", e => {
        if (nameInput.value.length > 16 && e.key !== "Backspace" && e.key !== 13 && e.key !== 37 && e.key !== 39 && e.key !== 9 && e.key !== 116 && nameInput.selectionStart == nameInput.selectionEnd) {
            e.preventDefault();
        }
    });
    nameInput.addEventListener("paste", e => {
        const clipboardData = e.clipboardData || window.Clipboard;
        if (clipboardData.getData("text").length + nameInput.value.length > 17) {
            e.preventDefault();
            alert('texto muito grande, você só tem mais ' + (17 - nameInput.value.length) + ' caracteres até o limite');
        }
    });
    nameInput.addEventListener('drop', e => e.preventDefault());
};
document.getElementById('createChatBtn').onclick = () => {
    if (nameInput.value.replace(/^\W+/, '') != '' && nameInput.value.length < 16) {
        let dado;  // Declare a variável fora do bloco .then()
        fetch('/enviar-dados', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then(response => response.json())
            .then(dados => {
                if (dados.length > 0) {
                    dado = dados[dados.length - 1];
                }
            })
            .catch(error => console.error('Erro ao enviar os dados:', error))
            .finally(() => {
                if (dado) {
                    chats.push(new chat(dado.id + 1, nameInput.value, '/img/newGroupImg.svg', [user, alunos[1]], [user], true));
                    groupCreator.style.display = '';
                    nameInput.value = '';
                }
            });
    }
}
/*talvez criar uma classe para o customContext, algumas propriedades:
color -> cor de fundo do contextMenu
value -> lista de elementos e sub elementos:
    value:{
        "op1":op1(),
        "op2":{
            "val1":func1(),
            "val2":func2(),
            "val3":func3()
        }
    }
*/
const msgContext = new Obj('div', ['msgContext'], document.body, "context");
class msg {
    constructor(content, file, time, owner, chat) {
        this.content = content.replace(/^\s+/, "").replace(/\u200E\s/g, "").replace(/</g, "&lt;").replace(/\n/g, '<br>');
        this.file = file;
        this.time = time.getHours().toString().padStart(2, '0') + ":" + new Date().getMinutes().toString().padStart(2, '0');
        this.owner = owner;
        this.chat = chat;
        this.msgsLength = this.chat.msgs.length;
        this.createMsg();
        //scroll
        this.chat.msgArea.scrollTop = this.chat.msgArea.scrollHeight;
    }
    get getMessage() {
        return this.msg
    }
    createMsg() {
        //Adicionar opção de editar
        this.chat.msgBalloon.value = '';
        this.msg = new Obj('div', ['msg', 'sended'], this.chat.msgArea);
        this.msg.translate = 'yes';
        //criar propriedade de arrasto, pressionando ctrl e selecionando uma mensagem lhe pemitindo a arrastar
        //A propriedade permitirá ao usuario responder mensagens arrastando-as para o input de mensagem ou encaminha-las
        //Ao soltar a mensagem sendo arrastada, ela voltará para seu local original de forma polida
        //Transformar em svg para mais interatividade, podendo copiar o svg para a area de transferencia
        //adicionar opção para adms poderem apagar as mensagens
        //adicionar opção de copiar o texto da mensagem
        this.msg.addEventListener('contextmenu', e => {
            e.preventDefault();
            e.stopPropagation();
            msgContext.style.display = 'flex';
            msgContext.style.left = `calc(${e.screenX}px)`;
            msgContext.style.top = `calc(${e.clientY}px)`;
            document.addEventListener('contextmenu', e => {
                if (e.target.classList != 'msgContext') {
                    msgContext.style.display = '';
                }
            })
            document.addEventListener('click', () => {
                msgContext.style.display = '';
            })
        })
        //owner
        this.msgTop = new Obj('div', ['msgTop'], this.msg);
        //improved whith AI:
        const LAST_MSG = this.chat.msgs.length > 0 ? this.chat.msgs[this.chat.msgs.length - 1] : null;
        if (LAST_MSG && LAST_MSG.owner == user) {
            this.msg.style.marginTop = "2px";
            this.msg.classList.add('msgList');
        } else {
            this.msgOwnerPic = new Obj('img', ['msgOwnerPic', 'lazyload'], this.msgTop);
            this.msgOwner = new Obj('p', ['msgOwner'], this.msgTop, `${this.owner.nome} ${this.owner.sobrenome}`);
            this.msgOwnerPic.dataset.src = '/img/user.svg';
        }
        if (LAST_MSG && LAST_MSG.time != this.time || this.chat.msgs.length == 0) {
            this.msgDate = new Obj('p', ['msgDate'], this.msgTop, this.time);
        } else {
            this.msg.classList.remove('msgList');
        }
        //
        this.filePlaceHolder = new Obj('div', ['filePlaceholder'], this.msg);
        //file
        if (this.file) {
            this.file.forEach(file => {
                file.style.display = 'flex'
                if (file.tagName.toLowerCase() == "audio") {
                    const playtime = new Obj('span', ['playTime'], this.filePlaceHolder)
                    const wavesurfer = WaveSurfer.create({
                        height: 45,
                        width: 240,
                        container: this.filePlaceHolder,
                        waveColor: 'white',
                        progressColor: '#9d9e9d',
                        cursorWidth: 2,
                        url: file.src,
                        minPxPerSec: 1,
                        //codigo disponivel em https://wavesurfer.xyz, modificado por AI:
                        renderFunction: (channels, ctx) => {
                            const { width, height } = ctx.canvas;
                            const scale = channels[0].length / width;
                            const step = 10;
                            // Encontrar o valor máximo absoluto nos samples do áudio
                            const maxAmplitude = Math.max(...channels[0].map(value => Math.abs(value)));
                            // Ajustar a escala dinamicamente
                            const dynamicScale = height / (2 * maxAmplitude);
                            ctx.translate(0, height / 2);
                            ctx.strokeStyle = ctx.fillStyle;
                            ctx.beginPath();
                            for (let i = 0; i < width; i += step * 2) {
                                const index = Math.floor(i * scale);
                                const value = Math.abs(channels[0][index]);
                                // Aplicar o fator de escala dinâmica
                                const scaleValue = value * dynamicScale;
                                let x = i;
                                let y = scaleValue;
                                ctx.moveTo(x, 0);
                                ctx.lineTo(x, y);
                                ctx.arc(x + step / 2, y, step / 2, Math.PI, 0, true);
                                ctx.lineTo(x + step, 0);
                                x = x + step;
                                y = -y;
                                ctx.moveTo(x, 0);
                                ctx.lineTo(x, y);
                                ctx.arc(x + step / 2, y, step / 2, Math.PI, 0, false);
                                ctx.lineTo(x + step, 0);
                            }
                            ctx.stroke();
                            ctx.closePath();
                        },
                    })
                    wavesurfer.on('ready', () => {
                        var dur = wavesurfer.getDuration();
                        var minutes = Math.floor(dur / 60);
                        var seconds = Math.floor(dur % 60);
                        minutes = (minutes < 10 ? "0" : "") + minutes;
                        seconds = (seconds < 10 ? "0" : "") + seconds;
                        playtime.innerText = minutes + ":" + seconds;
                    })
                    wavesurfer.on('timeupdate', () => {
                        var currentTime = wavesurfer.getDuration() - wavesurfer.getCurrentTime();
                        var minutes = Math.floor(currentTime / 60);
                        var seconds = Math.floor(currentTime % 60);
                        minutes = (minutes < 10 ? "0" : "") + minutes;
                        seconds = (seconds < 10 ? "0" : "") + seconds;
                        playtime.innerText = minutes + ":" + seconds;
                    })
                    wavesurfer.on('interaction', () => {
                        wavesurfer.play()
                    })
                    wavesurfer.on('finish', () => {
                        wavesurfer.setTime(0);
                        play.innerText = "play_arrow";
                    })
                    const play = new Obj('button', ['material-icons-outlined', 'playPause'], this.filePlaceHolder, 'play_arrow');
                    play.addEventListener('click', () => {
                        wavesurfer.playPause();
                        if (wavesurfer.isPlaying()) {
                            play.innerText = "pause";
                        } else {
                            play.innerText = "play_arrow"
                        }
                    })
                } else {
                    this.filePlaceHolder.appendChild(file);
                }
                /*file.addEventListener('click',()=>{
                    abrir arquivo em grande escala
                })*/
            })
        }
        if (this.filePlaceHolder.childElementCount == 0) {
            this.filePlaceHolder.style.display = 'none';
        }
        //emails
        const emails = this.content.match(/\b[A-Za-z0-9._%+-ãçõ]+@[A-Za-z0-9.-ã]+\.[A-Za-z]{2,}\b/g);
        if (emails) {
            emails.forEach(
                email => this.content = this.content.replace(email, `<a href="mailto:${email}" title="enviar email" target="_blank">${email}</a>`)
            );
        }
        //links
        const links = this.content.match(/https?:\/\/\S+/gi);
        if (links) links.forEach(link => this.content = this.content.replace(link, link.link(link)));
        //text decorations
        const formatRules = [
            { regex: /(\*)(.*?)(\*)/g, tag: 'strong' },
            { regex: /(\%)(.*?)(\%)/g, tag: 'i' },
            { regex: /(\~~)(.*?)(\~~)/g, tag: 'a', style: 'text-decoration: line-through 2px;' }
        ];
        for (const rule of formatRules) {
            this.content = this.content.replace(rule.regex, (match, p1, p2, p3) => {
                let leadingSpace = p2.startsWith(' ') ? '&nbsp;' : '';
                let trailingSpace = p2.endsWith(' ') ? '&nbsp;' : '';
                p2 = p2.trim().replace(/\s+/g, ' '); // Substitui múltiplos espaços por um único espaço
                return `<${rule.tag} ${rule.style ? `style='${rule.style}'` : ''}>${leadingSpace}${p2}${trailingSpace}</${rule.tag}>`;
            });
        }
        //bad words
        let bannedWordsRegex = new RegExp(this.chat.bannedWords.join("|"), "gi");
        this.content = sinonimos(binaryToText(this.content)).replace(bannedWordsRegex, matchedWord => '*'.repeat(matchedWord.length));
        //Text Content
        this.msgTextContent = new Obj('a', ['msgTextContent'], this.msg);
        this.msgTextContent.innerHTML = this.content;
    }
    readTextFile() {
        const reader = new FileReader();
        reader.readAsText(this.file);
        reader.onload = e => {
            const result = e.target.result;
            if (this.file.type === 'text/html') {
                this.htmlFileElement = new Obj('a', ['htmlFileBtn'], this.filePlaceHolder, this.file.name);
                this.htmlFileElement.href = URL.createObjectURL(new Blob([result], { type: 'text/html' }));
                this.htmlFileElement.target = '_blank';
            } else if (this.file.type === 'text/plain') {
                this.filePlaceHolder.innerText = result;
            }
        }
    }
}
let ldpalavrões = {
    'A': new Set(["λ", "Ꜳ", "ɋ", "∀", "Α", "α", "Δ", "∆", "Λ", "λ", "Ἃ", "Ἇ", "ά", "ᾰ", "Ᾰ", "Ά", "₳", "𝔞", "𝕒", "𝖆", "𝚊", "𝒶", "𝓪", "𝓪", "ᗩ", "ᴀ", "ᥲ", "ᵃ", "ɐ", "𝐚", "𝒂", "𝖺", "𝗮", "𝘢", "𝙖", "a̲", "a̳", "a̶", "a̷", "a͎", "a̾", "ⓐ", "🄰", "🅐", "🅰"]),
    'B': new Set(["฿", "₿", "Β", "β", "ᙠ"]),
    'C': new Set(["ɔ", "©", "℃", "Ⅽ", "ↅ", "Ↄ", "ⅽ", "⊑", "⊂", "⊏", "⊐", "⊉", "⊆", "⊇", "⊊", "⊋", "∁", "ↄ", "Ↄ", "⊈", "⋤", "⋥", "ς", "₡", "¢", "₠"]),
    'D': new Set(["Ⅾ", "Đ", "Ð", "đ", "₫"]),
    'E': new Set(["é", "£", "Ɛ", "∃", "∄", "∈", "∋", "Ě", "Ĕ", "⋻", "⋸", "⋵", "⋲", "⋳", "⋶", "⋹", "⋿", "Ε", "ε", "Ἓ", "Ἕ", "ὲ", "έ", "Έ", "έ", "Σ", "϶", "ϵ", "ξ", "₠", "€"]),
    'F': new Set(["℉", "₣", "ℱ", "Ꞙ", "ꝼ", "ⅎ", "ꜰ", "ꟻ"]),
    'G': new Set(["Ĝ", "Ğ", "Ģ", "ℊ", "ǥ", "ģ", "ĝ", "ğ", "₲", "Ḡ", "Ǧ", "ǧ"]),
    'H': new Set(["Ħ", "ħ", "ɧ", "ɦ", "Η", "ⱨ"]),
    'I': new Set(["ⅾ", "¡", "Ι", "ι", "ⅰ", "Ⅰ", "∣"]),
    'J': new Set(["ȷ", "ʝ", "ɉ", "ʲ", "ʆ ", "ʄ"]),
    'K': new Set(["ĸ", "Κ", "κ", "₭", "Ⲕ"]),
    'L': new Set(["|", "Ⅼ", "∟"]),
    'M': new Set(["Ⅿ", "ⅿ", "ɱ", "Σ", "Μ", "ℳ", "₥", "Ṃ", "Ṁ"]),
    'N': new Set(["Ν", "₦", "η"]),
    'O': new Set(["ʘ", "◯", "⊘", "⊙", "⊖", "⊜", "⊛", "⊕", "⨀", "⨁", "Ø", "Ο", "ο", "ϴ", "Ὸ", "Ό", "ὁ", "Ὁ", "Φ", "σ", "φ", "ὄ", "Ὄ", "Ὂ", "ὂ"]),
    'P': new Set(["℗", "₱", "₽", "Ρ", "ρ"]),
    'Q': new Set(["ℚ", "Ɋ", "ʠ"]),
    'R': new Set(["Π", "π", "®"]),
    'S': new Set(["§", "₷", "$"]),
    'T': new Set(["⊥", "⊤", "⊢", "⊣", "Τ", "τ"]),
    'U': new Set(["⋃", "⋂", "⊔", "⊍", "⊌", "⊎", "⨃", "⨄", "υ", "Ω", "ύ", "Ὧ", "ᾩ", "ᾭ", "Ὣ", "μ"]),
    'V': new Set(["ν", "ν", "ѵ", "Ѵ", "∨", "√", "ⱱ", "ṿ"]),
    'W': new Set(["₩", "ὣ", "ῳ"]),
    'X': new Set(["Ⅹ", "⨉", "Χ"]),
    'Y': new Set(["γ", "Ψ", "Ὑ", "Υ"]),
    'Z': new Set(["Ζ", "₴"]),
    ' ': new Set(["⠀", "ㅤ", "￿"]),
    '2': new Set(['ƻ'])
};
function sinonimos(synonyms) {
    return synonyms.split('').map(synonym => {
        let lowerCaseSynonym = synonym.toLowerCase();
        for (let letter in ldpalavrões) {
            if (ldpalavrões[letter].has(lowerCaseSynonym)) return letter;
        }
        return synonym; // retorna o sinônimo original se não for encontrado
    }).join('');
};
function binaryToText(str) {
    if (/^(?=.*(\d.*\d.*\d.*\d.*\d.*\d.*\d.*\d))[01\s]*$/.test(str)) {
        return str.split(' ').map((bin) => {
            return String.fromCharCode(parseInt(bin, 2));
        }).join('');
    } else return str
};