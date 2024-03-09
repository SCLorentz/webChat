//Aqui ficam todas as funções mais complexas da pagina (islands of interactivity)

const chats = [],
    alunos = [],
    user = { nome: "you", sobrenome: "user", img: '/img/User.svg', email: `${"user"}@example.com` },
    popup = document.getElementById('popup'),
    msgContext = Obj('div', ['msgContext'], document.body, "context");

function Obj(type, classes, father, txt) {
    const e = document.createElement(type);
    e.classList.add(...classes);
    father.appendChild(e);
    if (txt) e.innerText = e.placeholder = e.alt = txt;
    if (type == 'button') e.tabIndex = '0';
    return e;
}

Object.defineProperty(Element.prototype, 'disp', {
    set: function (s) {
        this.style.display = s;
    }
});

for (let i = 0; i < 8; i++) {
    const aluno = {
        nome: 'nome' + i,
        sobrenome: 'sobrenome' + i,
        img: '/img/User.svg',
        email: `nome${i}@example.com`,
        id: 1 + i,
    };
    alunos.push(aluno);
}

class chat {
    constructor(id, name, thumb, guests, adm) {
        this.id = "chat:" + id;
        this.name = name;
        this.thumb = thumb;
        this.guests = guests;
        this.bannedWords = null;
        this.adm = adm;
        this.build();
        this.ChatConfigs();
        this.Thumb();
        this.Msgs();
        this.msgs = [];
        //obter palavras banidas do grupo e globais
    }
    build() {
        this.chatElement = Obj('div', ['chat', 'chatMenu'], document.body);
        this.chatElement.id = this.id;
        //this.chatElement.addEventListener('contextmenu', e => e.preventDefault());
        this.thumbDiv = Obj('div', ['thumbDiv'], this.chatElement);
        this.arrowBack = Obj('button', ['arrowBack', 'material-symbols-outlined'], this.thumbDiv, "arrow_back_ios"); //mobile
        //thumbPicture
        this.thumbPicture = Obj('img', ['thumbPicture', 'chatImg'], this.thumbDiv, "chat image");
        this.thumbPicture.src = this.thumb;
        this.thumbDiv.innerHTML += this.name;
        this.thumbPicture = this.thumbDiv.children[1];
        //
        const backArrow = Array.from(document.getElementsByClassName('arrowBack')), salvos = document.getElementById('salvos');
        backArrow.forEach(e => e.disp = window.innerWidth <= 850 ? 'flex' : '');
        window.addEventListener('resize', () => {
            if (window.innerWidth >= 850 && salvos.disp == 'none') salvos.disp = "grid";
            backArrow.forEach(e => {
                e.disp = window.innerWidth <= 850 ? 'flex' : '';
                e.onclick = () => salvos.disp = "grid";
            })
        })
        //pesquisar
        this.searchBtn = Obj('button', ['searchOnGroupBtn', 'material-symbols-outlined'], this.thumbDiv, 'search');
        this.searchInput = Obj('input', ['searchOnGroupInput'], this.searchBtn, 'pesquisar...');
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
                this.msgs.forEach(msg =>
                    msg.getMsg.disp = (
                        [...msg.content].filter((char, index) => char == this.searchInput.value.charAt(index)).length / msg.content.length < 0.7 && this.searchInput.value !== '' && msg.content
                    ) ? 'none' : 'block'
                    //verificar se o input !== '' && conteudo da mensagem ~=(70%) input
                )
            }
        })
        //video call
        this.call = Obj('button', ['videoCam', 'material-symbols-outlined'], this.thumbDiv, 'videocam');
        this.call.onclick = () => {
            window.open('/call')
        }
        this.imageOpened = Obj('div', ['imageOpened'], this.chatElement);
        Obj('button', ['material-symbols-outlined'], this.imageOpened, 'close').style.height = 'fit-content';
    }
    ChatConfigs() {
        this.openConfig = Obj('button', ['groupInfo', 'material-symbols-outlined'], this.thumbDiv, "more_vert");
        this.chatConfig = Obj('div', ['chatConfigs', 'chatMenu'], document.body);
        this.back = Obj('button', ['material-symbols-outlined', 'back'], this.chatConfig, 'arrow_back_ios')
        this.back.onclick = () => config(false, this);
        this.openConfig.onclick = () => config(true, this);
        function config(v, e) {
            e.chatConfig.disp = v ? 'grid' : 'none';
            e.chatElement.disp = v ? 'none' : 'grid';
        }
        /*const c = (v,  { chatConfig, chatElement } = this) => {
            chatConfig.disp = v ? 'grid' : 'none';
            chatElement.disp = v ? 'none' : 'grid';
        }*/
        this.editGroup();
        this.GuestList();
    }
    Thumb() {
        const menu = document.getElementById('contatos');
        this.thumbnail = Obj('button', ['thumbnail'], menu, this.name);
        //
        this.thumbBtnImg = Obj('img', ['chatImg'], this.thumbnail, this.name)
        this.thumbBtnImg.src = this.thumb;
        //
        this.thumbnail.onclick = () => {
            document.querySelectorAll('.chat, .chatConfigs, .picMenu, .newGuestMenu').forEach(e => e.disp = 'none');
            this.chatElement.disp = 'grid';
            localStorage.setItem('lastChat', this.id);
            //thumb
            document.querySelectorAll('.thumbnail').forEach(e => e.style.background = '');
            this.thumbnail.style.background = '#0000002b';
            if (window.innerWidth <= 850) document.getElementById('salvos').disp = 'none';
        }
        menu.scrollTop = menu.scrollHeight;
    }
    guestListFunction() {
        document.querySelectorAll('.guestInList, .addGuest').forEach(e => {
            if (e.parentNode == this.guestList) e.parentNode.removeChild(e)
        })
        this.addGuest = Obj('button', ['material-symbols-outlined', 'addGuest'], this.guestList, 'person_add');
        this.addGuest.onclick = () => this.newGuestMenu.disp = 'flex';
        this.guests.forEach(guest => {
            const guestInList = Obj('button', ['guestInList'], this.guestList, guest.nome + ' ' + guest.sobrenome),
                guestInfo = Obj('div', ['guestInfo'], guestInList),
                guestInListImg = Obj('img', [], guestInList),
                removeGuest = Obj('p', ['removeGuest', 'material-symbols-outlined'], guestInfo, "person_remove"),
                toAdm = Obj('p', ['tornarAdm', 'material-symbols-outlined'], guestInfo);
            guestInList.addEventListener('contextmenu', e => {
                e.preventDefault();
                guestInfo.disp = 'flex';
                guestInList.addEventListener('mouseleave', () => guestInfo.disp = '');
            });
            Obj('img', [], Obj('div', [], guestInfo, `${guest.nome} ${guest.sobrenome}`)).src = guest.img;
            //email
            this.guestEmail = Obj('span', ['email'], guestInfo, guest.email);
            this.guestEmail.title = 'copy';
            this.guestEmail.onclick = () => {
                try {
                    navigator.clipboard.writeText(guest.email);
                } catch (err) {
                    console.error('Erro ao copiar texto: ', err);
                }
            }
            guestInListImg.src = guest.img;
            //remove guest
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
                c.guests.splice(c.guests.indexOf(g), 1); //preciso adicionar o usuario removido para "add guests" novamente
                if (c.adm.indexOf(g) != -1) c.adm.splice(c.adm.indexOf(g), 1);
            }
            toAdm.innerText = this.adm.includes(guest) ? 'gpp_bad' : 'shield_person';
            toAdm.onclick = () => {
                if (this.adm.includes(user)) {
                    if (this.adm.includes(guest)) this.adm.splice(this.adm.indexOf(guest), 1);
                    else this.adm.push(guest);
                    toAdm.innerText = this.adm.includes(guest) ? 'gpp_bad' : 'shield_person';
                }
            }
        })
    }
    GuestList() {
        this.guestList = Obj('div', ['guestList'], this.chatConfig)
        this.guestList.innerHTML = '<h3 id="titleGuests">guests</h3>';
        this.guestListFunction()
        //guestList add btn
        this.newGuestMenu = Obj('div', ['newGuestMenu'], this.chatConfig);
        this.closeNewGuestMenu = Obj('button', ['closeBtn', 'material-symbols-outlined'], this.newGuestMenu, 'close');
        this.closeNewGuestMenu.onclick = () => this.newGuestMenu.disp = 'none';
        this.addNewGuestTitle = Obj('h2', [], this.newGuestMenu, 'add guests');
        //add
        this.guestsToAdd = Obj('div', ['guestsToAdd'], this.newGuestMenu);
        alunos.forEach(aluno => {
            if (!this.guests.includes(aluno)) {
                const add = Obj('button', [], this.guestsToAdd, `${aluno.nome} ${aluno.sobrenome}`), img = Obj('img', ['addUserImg'], add);
                img.src = aluno.img;
                add.onclick = () => {
                    this.guests.push(aluno);
                    add.parentNode.removeChild(add);
                    this.guestListFunction() //corrigir bugs
                    //atualizar para verção posts
                    fetch('/enviar', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    }).then().catch(error => console.error('Erro ao enviar os dados:', error));
                }
            }
        })
    }
    editGroup() {
        //edit group img
        this.img = Obj('img', ['groupImg', 'chatImg'], this.chatConfig);
        this.img.src = this.thumb;
        //
        this.imgInput = Obj("input", [], this.chatConfig);
        this.imgInput.type = 'file';
        this.imgInput.accept = "image/svg+xml";
        this.imgInput.disp = 'none';
        //this.picMenuOff.element.addEventListener('click',()=> this.picMenuOff.element.disp = "none");
        this.picMenu = Obj('div', ['picMenu'], this.chatConfig);
        this.buttons = [
            { name: 'picMenuUpload', ico: 'upload' },
            { name: 'picMenuCam', ico: 'photo_camera' },
            { name: 'picMenuNew', ico: 'add' },
            { name: 'picMenuEdit', ico: 'edit' },
            { name: 'picMenuDel', ico: 'delete' }
        ];
        this.buttons.forEach(btn => this[btn.name] = Obj('button', ['picMenuBtn', 'material-symbols-outlined'], this.picMenu, btn.ico));
        document.addEventListener('click', e => {
            e.stopPropagation();
            if (!this.picMenu.contains(e.target) && e.target !== this.picMenu && e.target !== this.img) this.picMenu.disp = '';
        })
        this.img.addEventListener('click', () => {
            this.picMenu.disp = "flex";
            this.picMenu.style.top = `calc(50% - ${this.picMenu.offsetHeight / 2}px)`;
            this.picMenu.style.left = `calc(50% - ${this.picMenu.offsetWidth / 2}px)`;
            //comando para fechar o menu
        });
        //foto
        this.capture = Obj('video', ['picMenuVidCap'], this.picMenu);
        this.capture.autoplay = true;
        this.CaptureBtn = Obj('button', ['vidCapBtn', 'picMenuVidCap', 'material-symbols-outlined'], this.picMenu, "add_a_photo");
        this.picMenuCanvas = Obj('canvas', ['picMenuCanvas'], this.picMenu);
        this.picMenuCanvas.height = "300";
        this.picMenuCanvas.width = "400";
        this.picMenuCam.addEventListener('click', () => {
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                navigator.mediaDevices.getUserMedia({ video: true })
                    .then(stream => {
                        Array.from(document.getElementsByClassName('picMenuVidCap')).forEach(e => e.disp = "flex");
                        this.capture.srcObject = stream;
                        Array.from(document.getElementsByClassName('picMenuBtn')).forEach(e => e.disp = "none");
                        this.picMenu.style.top = `calc(50% - ${this.picMenu.offsetHeight / 2}px)`;
                        this.picMenu.style.left = `calc(50% - ${this.picMenu.offsetWidth / 2}px)`;
                    })
                    .catch(error => console.error("Erro ao acessar a câmera: ", error));
            }
            this.CaptureBtn.addEventListener('click', () => {
                this.picMenuCanvas.getContext('2d').drawImage(this.capture, 0, 0, 400, 300);
                this.picMenuCanvas.disp = 'flex';
                this.capture.disp = "none";
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
            this.picMenu.disp = "none";
        })
        function changeImg(c) {
            c.thumbBtnImg.src = c.img.src = c.thumbPicture.src = c.thumb;
            fetch('/enviar', {
                method: 'POST', // Método da requisição (pode ser GET, POST, PUT, DELETE, etc.)
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    type: "EDIT",
                    target: "chats",
                    column: "img",
                    value: c.thumb,
                    id: c.id.replace(/^chat:\s*/, "")
                })
            }).then(response => response.json())
                .then(responseData => console.log(responseData))
                .catch(error => console.error(error))
        }
        //Criar editor svg com animações pre-definidas e por script
        //rename group
        this.rename = Obj('textarea', ['renameGroup'], this.chatConfig, 'rename');
        this.rename.spellcheck = false;
        this.rename.value = this.name;
        this.rename.addEventListener("paste", e => {
            const c = e.clipboardData || window.Clipboard;
            if (c.getData("text").length + this.rename.value.length > 17) {
                e.preventDefault();
                alert('texto muito grande, você só tem mais ' + (17 - this.rename.value.length) + ' caracteres até o limite');
            }
        });
        this.rename.addEventListener("keydown", e => {
            const keyList = [37, 39, 46, 9, 8, 116]
            if (this.rename.value.length > 16 && !keyList.includes(e.keyCode) && this.rename.selectionStart == this.rename.selectionEnd) {
                e.preventDefault();
            }
            if (e.keyCode == 13) {
                e.preventDefault();
                this.renameGroup();
            }
        });
        this.rename.onblur = () => this.renameGroup();
        this.rename.addEventListener('drop', e => e.preventDefault());
        this.desc = Obj('input', ['groupDesc'], this.chatConfig, 'description');
        //del group
        this.delete = Obj('button', ['deleteGroup', 'material-symbols-outlined'], this.chatConfig, 'delete');
        this.delete.title = 'burn everything';
        this.delete.onclick = () => {
            if (confirm("deseja apagar este grupo?")) {
                ["chatElement", "chatConfig", "thumbnail"].forEach(e => this[e].parentNode.removeChild(this[e]))
                chats.splice(this.id - 1, 1);
                //server DB
                fetch('/enviar', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        type: "DELETE",
                        target: "chats",
                        id: this.id.replace(/^chat:\s*/, "")
                    })
                }).then(response => response.json())
                    .then(responseData => console.log(responseData))
                    .catch(error => console.error(error))
            }
        }
    }
    renameGroup() {
        if (this.rename.value != this.name && this.rename.value.replace(/^\W+/, '') !== '') {
            this.thumbDiv.childNodes[2].nodeValue = this.thumbnail.firstChild.nodeValue = this.name = this.rename.value;
            this.rename.value = this.rename.value.replace(/^\W+/, '');
            //
            fetch('/enviar', {
                method: 'POST', // Método da requisição (pode ser GET, POST, PUT, DELETE, etc.)
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    type: "EDIT",
                    target: "chats",
                    column: "name",
                    value: this.rename.value,
                    id: this.id.replace(/^chat:\s*/, "")
                })
            }).then(response => response.json())
                .then(responseData => console.log(responseData))
                .catch(error => console.error(error))
            //corrigir bugs de renomeio muito rapido (0.3sec), aplicar delay para mostrar o pop-up
            //mudar a mensagem do pop-up caso haja um erro como "erro ao enviar os dados"
            popup.innerText = "Grupo Renomeado!";
            popup.disp = "flex";
            popup.style.top = '0%';
            popup.style.left = `calc(50% - ${popup.offsetWidth / 2}px)`;
            setTimeout(() => {
                popup.style.top = '-20%';
                popup.addEventListener('transitionend', () => popup.disp = "")
            }, 3000)
        } else this.rename.value = this.name;
    }
    Msgs() {
        this.msgArea = Obj('div', ['msgArea'], this.chatElement);
        //scroll to the bottom
        this.toBottom = Obj('button', ['toBottom', 'material-symbols-outlined'], this.msgArea, 'arrow_downward');
        this.msgArea.onscroll = () => this.toBottom.disp = (this.msgArea.scrollTop < this.msgArea.scrollHeight - 800) ? "block" : "none";
        this.toBottom.onclick = () => this.msgArea.scrollTop = this.msgArea.scrollHeight;
        //file preview
        this.inputChat = Obj('div', ['inputChat'], this.chatElement);
        this.previewSlides = Obj('div', ['previewSlides'], this.inputChat);
        this.previewArrowBackward = Obj('button', ['material-symbols-outlined', 'previewArrow'], this.inputChat, 'arrow_back_ios_new');
        this.previewArrowFoward = Obj('button', ['material-symbols-outlined', 'previewArrow'], this.inputChat, 'arrow_forward_ios');
        this.previewArrowFoward.style.left = '95%';
        //msgBallon
        //adicionar corretor automatico e sujestão de palavras
        //Ao começar a digitar, primeira letra em maiusculo (exeto quando o shift está ativado)
        //adicionar menu de emojis e codigos de emojis (#-EMOJI-#) 
        this.msgBalloon = Obj('textarea', ['msgBalloon'], this.inputChat);
        this.msgBalloon.placeholder = 'vontade de falar...';
        this.attach = Obj('button', ['attach', 'material-symbols-outlined'], this.inputChat, "attach_file");
        //audio recorder
        //gravação de audio
        //recursos de legendas para quem não puder ouvir o audio
        this.inputAudio = Obj('button', ['material-symbols-outlined', 'inputAudio'], this.inputChat, 'mic');
        let transferfiles = [], record = true;
        this.inputAudio.onclick = () => {
            if (record) {
                this.inputAudio.classList.add("recordingAudio");
                this.inputAudio.innerText = "stop_circle";
                this.attach.disp = "none";
                this.msgBalloon.disabled = true;
                record = false;
            } else {
                this.inputAudio.classList.remove("recordingAudio");
                this.inputAudio.innerText = "mic";
                this.attach.disp = "inline-block";
                this.msgBalloon.disabled = false;
                record = true;
            }
        }
        this.msgBalloon.addEventListener('drop', e => { //drop não funciona em this.msgArea, pesquisar o motivo e corrigir
            e.preventDefault();
            if (e.dataTransfer.files.length > 1) {
                this.previewArrowFoward.disp = this.previewArrowBackward.disp = 'inline';
                this.previewArrowFoward.addEventListener('click', () => changeSlide(i + 1, this.previewSlides));
                this.previewArrowBackward.addEventListener('click', () => changeSlide(i - 1, this.previewSlides));
            }
            for (const dataFile of e.dataTransfer.files) {
                const reader = new FileReader();
                reader.readAsDataURL(dataFile);
                reader.onload = e => {
                    if (dataFile.type.startsWith('image/')) {
                        this.preview = Obj('img', [], this.previewSlides);
                        this.preview.src = e.target.result;
                    } else if (dataFile.type.startsWith('audio/')) {
                        //lidar com uma biblioteca para deno
                        this.preview = Obj('audio', [], this.previewSlides);
                        this.preview.load();
                        this.preview.src = e.target.result;
                    } else if (dataFile.type.startsWith('video/')) {
                        //lidar com videos usando a API do youtube
                        this.preview = Obj('video', [], this.previewSlides);
                        this.preview.load();
                        this.preview.src = e.target.result;
                    }
                    this.preview.disp = 'none';
                    this.previewSlides.disp = 'flex';
                    this.previewSlides.childNodes[0].disp = 'block';
                    this.preview.controls = true;
                    transferfiles.push(this.preview)
                }
            }
            let i = 0;
            function changeSlide(index, e) {
                if (index < e.childNodes.length && index >= 0) {
                    if (e.childNodes[i].nodeName == 'VIDEO' || e.childNodes[i].nodeName == 'AUDIO') e.childNodes[i].pause();
                    e.childNodes[i].disp = 'none';
                    i = index;
                    e.childNodes[i].disp = 'block';
                }
            }
        });
        let keys = {};
        this.msgBalloon.addEventListener('keydown', e => {
            keys[e.key] = true;
            if (keys['Enter'] && !keys['Shift']) {
                e.preventDefault();
                if (this.msgBalloon.value.replace(/^\s+/, "").replace(/[\u200E\s⠀ㅤ]/g, "") !== '' || transferfiles.length !== 0) {
                    if (transferfiles.length > 0) {
                        this.preview.parentNode.removeChild(this.preview);
                        this.inputChat.style.height = '';
                        this.previewSlides.disp = '';
                        this.msgs.push(new msg(this.msgBalloon.value, transferfiles, new Date(), user, this));
                        transferfiles = [];
                    } else this.msgs.push(new msg(this.msgBalloon.value, null, new Date(), user, this));
                }
            }
        });
        this.msgBalloon.addEventListener('keyup', e => keys[e.key] = false);
        this.msgBalloon.addEventListener('paste', e => {
            /*e.clipboardData.items.forEach(e => {
                if (e.type.indexOf('image/') !== -1) {
                    this.msgs.push(new msg(this.msgBalloon.value, e.getAsFile(), new Date(), user, this));
                }
            })*/
            //corrigir bugs e atualizar codigo para disponibilizar o preview
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

export { chats, alunos, Obj, user, chat }

class msg {
    constructor(content, file, time, owner, chat) {
        this.content = content.replace(/^\s+/, "").replace(/\u200E\s/g, "").replace(/</g, "&lt;").replace(/\n/g, '<br>');
        this.file = file;
        this.time = time.getHours().toString().padStart(2, '0') + ":" + new Date().getMinutes().toString().padStart(2, '0');
        this.owner = owner;
        this.chat = chat;
        this.msgsLength = this.chat.msgs.length;
        this.Msgs();
        //scroll
        this.chat.msgArea.scrollTop = this.chat.msgArea.scrollHeight;
    }
    get getMsg() { return this.msg }
    Msgs() {
        //Adicionar opção de editar
        this.chat.msgBalloon.value = '';
        this.msg = Obj('div', ['msg', 'sended'], this.chat.msgArea);
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
            msgContext.disp = 'flex';
            msgContext.style.left = `calc(${e.screenX}px)`;
            msgContext.style.top = `calc(${e.clientY}px)`;
            document.addEventListener('contextmenu', e => {
                if (e.target.classList != 'msgContext') msgContext.disp = '';
            })
            document.addEventListener('click', () => msgContext.disp = '');
        })
        //owner
        this.msgTop = Obj('div', ['msgTop'], this.msg);
        //improved whith AI:
        const LAST_MSG = this.chat.msgs.length > 0 ? this.chat.msgs[this.chat.msgs.length - 1] : null;
        if (LAST_MSG && LAST_MSG.owner == user) {
            this.msg.style.marginTop = "2px";
            this.msg.classList.add('msgList');
        } else {
            this.msgTop.style.marginBottom = "5px";
            this.msgOwnerPic = Obj('img', ['msgOwnerPic'/*, 'lazyload'*/], this.msgTop);
            this.msgOwner = Obj('p', ['msgOwner'], this.msgTop, `${this.owner.nome} ${this.owner.sobrenome}`);
            this.msgOwnerPic.src = '/img/User.svg';
        }
        if (LAST_MSG && LAST_MSG.time != this.time || this.chat.msgs.length == 0) {
            this.msgDate = Obj('p', ['msgDate'], this.msgTop, this.time);
        } else {
            this.msg.classList.remove('msgList');
        }
        //
        this.filePlaceHolder = Obj('div', ['filePlaceholder'], this.msg);
        //file --> carregamento de novas mensagens.
        //O carregamento de arquivos em mensagens antigas deve ser feito dentro da classe msg, pois não há previsualização do envio.
        if (this.file) {
            this.file.forEach(file => {
                file.disp = 'flex'
                if (file.tagName.toLowerCase() == "audio") {
                    const playtime = Obj('span', ['playTime'], this.filePlaceHolder)
                    const wavesurfer = WaveSurfer.create({
                        height: 45,
                        width: 240,
                        container: this.filePlaceHolder,
                        waveColor: 'white',
                        progressColor: '#9d9e9d',
                        cursorWidth: 2,
                        url: file.src,
                        minPxPerSec: 1,
                        //codigo disponivel em https://wavesurfer.xyz, modificado por AI, formatado e otimizado por mim:
                        renderFunction: (channels, ctx) => {
                            const { width, height } = ctx.canvas,
                                scale = channels[0].length / width,
                                step = 10,
                                // Encontrar o valor máximo absoluto nos samples do áudio
                                maxAmplitude = Math.max(...channels[0].map(value => Math.abs(value))),
                                // Ajustar a escala dinamicamente
                                dynamicScale = height / (2 * maxAmplitude);
                            ctx.translate(0, height / 2);
                            ctx.strokeStyle = ctx.fillStyle;
                            ctx.beginPath();
                            for (let i = 0; i < width; i += step * 2) {
                                const index = Math.floor(i * scale),
                                    value = Math.abs(channels[0][index]),
                                    // Aplicar o fator de escala dinâmica
                                    scaleValue = value * dynamicScale;
                                let x = i,
                                    y = scaleValue;
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
                        var dur = wavesurfer.getDuration(),
                            minutes = Math.floor(dur / 60),
                            seconds = Math.floor(dur % 60);
                        minutes = (minutes < 10 ? "0" : "") + minutes;
                        seconds = (seconds < 10 ? "0" : "") + seconds;
                        playtime.innerText = minutes + ":" + seconds;
                    })
                    wavesurfer.on('timeupdate', () => {
                        var currentTime = wavesurfer.getDuration() - wavesurfer.getCurrentTime(),
                            minutes = Math.floor(currentTime / 60),
                            seconds = Math.floor(currentTime % 60);
                        minutes = (minutes < 10 ? "0" : "") + minutes;
                        seconds = (seconds < 10 ? "0" : "") + seconds;
                        playtime.innerText = minutes + ":" + seconds;
                    })
                    wavesurfer.on('interaction', () => wavesurfer.play())
                    wavesurfer.on('finish', () => {
                        wavesurfer.setTime(0);
                        play.innerText = "play_arrow";
                    })
                    const play = Obj('button', ['material-symbols-outlined', 'playPause'], this.filePlaceHolder, 'play_arrow');
                    play.addEventListener('click', () => {
                        wavesurfer.playPause();
                        play.innerText = wavesurfer.isPlaying() ? "pause" : "play_arrow";
                    })
                } else {
                    this.filePlaceHolder.appendChild(file);
                }
                /*file.addEventListener('click',()=>{
                    abrir arquivo em grande escala
                })*/
            })
        }
        if (this.filePlaceHolder.childElementCount == 0) this.filePlaceHolder.disp = 'none';
        //emails e links
        const emails = this.content.match(/\b[A-Za-z0-9._%+-ãçõ]+@[A-Za-z0-9.-ã]+\.[A-Za-z]{2,}\b/g),
            links = this.content.match(/https?:\/\/\S+/gi),
            formatRules = [
                { regex: /(\*)(.*?)(\*)/g, tag: 'strong' },
                { regex: /(\%)(.*?)(\%)/g, tag: 'i' },
                { regex: /(\~~)(.*?)(\~~)/g, tag: 'a', style: 'text-decoration: line-through 2px;' }
            ];
        if (emails) emails.forEach(m => this.content = this.content.replace(m, `<a href="mailto:${m}" title="email" target="_blank">${m}</a>`));
        if (links) links.forEach(l => this.content = this.content.replace(l, l.link(l)));
        //text decorations
        for (const rule of formatRules) {
            this.content = this.content.replace(rule.regex, (match, p1, p2, p3) => {
                let l = p2.startsWith(' ') ? '&nbsp;' : '',
                    t = p2.endsWith(' ') ? '&nbsp;' : '';
                p2 = p2.trim().replace(/\s+/g, ' '); // Substitui múltiplos espaços por um único espaço
                return `<${rule.tag} ${rule.style ? `style='${rule.style}'` : ''}>${l}${p2}${t}</${rule.tag}>`;
            });
        }
        //bad words
        //let bannedWordsRegex = new RegExp(this.chat.bannedWords.join("|"), "gi");
        //this.content = sinonimos(binaryToText(this.content)).replace(bannedWordsRegex, matchedWord => '*'.repeat(matchedWord.length));
        //Text Content
        this.msgTextContent = Obj('span', ['msgTextContent'], this.msg);
        this.msgTextContent.innerHTML = this.content;
    }
    readTextFile() {
        const reader = new FileReader();
        reader.readAsText(this.file);
        reader.onload = e => {
            const result = e.target.result;
            if (this.file.type === 'text/html') {
                this.htmlFileElement = Obj('a', ['htmlFileBtn'], this.filePlaceHolder, this.file.name);
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