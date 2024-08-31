// deno-lint-ignore-file no-window no-window-prefix no-unused-vars prefer-const
//Aqui ficam todas as funções mais complexas da pagina (islands of interactivity)
import { saveData } from "./island.js";
import init, { obj } from "/frontend/wasm.js";

const chats = [],
      alunos = [],
      user = { nome: "Felipe", sobrenome: "Lorentz", img: "/no-photo-avaliable.svg", email: "user.email@domain.org.br"},
      //user = { nome: userData.given_name, sobrenome: `${userData.family_name} (você)`, img: userData.picture, email: userData.email },
      popup = document.getElementById('popup');

let msgContext = null;
init().then(() => {
    msgContext = obj('div', ['msgContext'], document.body, "context");
})

Object.defineProperty(Element.prototype, 'disp', {
    set: function(s) {
        this.style.display = s;
    }
});

for (let i = 0; i < 8; i++) {
    const aluno = {
        nome: 'nome' + i,
        sobrenome: 'sobrenome' + i,
        img: '/User.svg',
        email: `nome${i}@example.com`,
        id: 1 + i,
    };
    alunos.push(aluno);
}

// refazer usando rust e wasm
class chat {
    constructor(id, name, thumb, guests, adm) {
        this.id = id;
        this.name = name;
        this.thumb = thumb;
        this.guests = guests;
        this.adm = adm;
        this.build();
        this.Msgs();
        this.msgs = [];
    }
    build() {
        this.chatElement = obj('div', ['chat', 'chatMenu'], document.body, "");
        this.chatElement.id = this.id;
        //this.chatElement.addEventListener('contextmenu', e => e.preventDefault());
        this.thumbDiv = obj('div', ['thumbDiv'], this.chatElement, "");
        obj('button', ['arrowBack', 'material-symbols-outlined'], this.thumbDiv, "arrow_back_ios", ""); //mobile
        // thumbPicture
        this.thumbPicture = obj('img', ['chatImg'], this.thumbDiv, "chat image");
        this.thumbPicture.src = this.thumb;
        this.thumbDiv.innerHTML += this.name;
        this.thumbPicture = this.thumbDiv.children[1];
        //
        const backArrow = Array.from(document.getElementsByClassName('arrowBack')), salvos = document.getElementById('salvos');
        backArrow.forEach(e => e.disp = window.innerWidth <= 850 ? 'flex' : '');
        window.addEventListener('resize', () => {
            //
            salvos.disp = (window.innerWidth >= 850 && salvos.disp == 'none') ? "grid" : "";
            backArrow.forEach(e => {
                e.disp = window.innerWidth <= 850 ? 'flex' : '';
                e.onclick = () => salvos.disp = "grid";
            })
        })
        // pesquisar
        this.searchBtn = obj('button', ['searchOnGroupBtn', 'material-symbols-outlined'], this.thumbDiv, 'search');
        this.searchInput = obj('input', ['searchOnGroupInput'], this.searchBtn, 'pesquisar...');
        // search action
        this.searchBtn.onclick = () => {
            this.searchInput.style.width = this.thumbDiv.offsetWidth / 6 + 'px';
            this.searchInput.focus();
            // search animation
            document.onclick = () => this.searchInput.style.width = (
                document.activeElement !== this.searchInput && this.searchInput.value == ''
            ) ? null : this.thumbDiv.offsetWidth / 5 + 'px';
        }
        this.searchInput.addEventListener('keydown', e => {
            if (e.key != 8) return
            //
            e.preventDefault();
            this.msgs.forEach(msg =>
                msg.getMsg.disp = (
                    [...msg.content].filter((char, index) => char == this.searchInput.value.charAt(index)).length / msg.content.length < 0.7 && this.searchInput.value !== '' && msg.content
                ) ? 'none' : 'block'
                // verificar se o input !== '' && conteudo da mensagem ~=(70%) input
            )
        })
        // video call
        this.call = obj('button', ['videoCam', 'material-symbols-outlined'], this.thumbDiv, 'videocam');
        this.call.onclick = () => {
            window.open('/call')
        }
        this.imageOpened = obj('div', ['imageOpened'], this.chatElement, "");
        obj('button', ['material-symbols-outlined'], this.imageOpened, 'close').style.height = 'fit-content';
        //
        const menu = document.getElementById('contatos');
        this.thumbnail = obj('button', ['thumbnail'], menu, "");
        //
        this.thumbBtnImg = obj('img', ['chatImg'], this.thumbnail, this.name)
        this.thumbBtnImg.src = this.thumb;
        obj('span',[],this.thumbnail, this.name, "");
        //
        this.thumbnail.onclick = () => {
            // close prev. chats
            document.querySelectorAll('.chat, .chatConfigs, .picMenu, .newGuestMenu').forEach(e => e.disp = 'none');
            // open the chat
            this.chatElement.disp = 'grid';
            // set cookie 'lastChat' as this chat id
            localStorage.setItem('lastChat', this.id);
            //
            document.title = `Chat | ${this.name}`;
            // thumbnail, set colors
            document.querySelectorAll('.thumbnail').forEach(e => e.style.background = '');
            this.thumbnail.style.background = '#0000002b';
            //
            document.getElementById('salvos').disp = window.innerWidth <= 850 ? 'none' : '';
        }
        menu.scrollTop = menu.scrollHeight;
        //
        // config
        //
        this.openConfig = obj('button', ['groupInfo', 'material-symbols-outlined'], this.thumbDiv, "more_vert");
        this.chatConfig = obj('div', ['chatConfigs', 'chatMenu'], document.body, "");
        //
        this.back = obj('button', ['material-symbols-outlined', 'back'], this.chatConfig, 'arrow_back_ios')
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
        //
        this.guestList = obj('div', ['guestList'], this.chatConfig, "");
        // review
        this.guestList.innerHTML = '<h3 id="titleGuests">guests</h3>';
        this.guestListFunction()
        //guestList add btn
        this.newGuestMenu = obj('div', ['newGuestMenu'], this.chatConfig, "");
        this.closeNewGuestMenu = obj('button', ['closeBtn', 'material-symbols-outlined'], this.newGuestMenu, 'close');
        this.closeNewGuestMenu.onclick = () => this.newGuestMenu.disp = 'none';
        this.addNewGuestTitle = obj('h2', [], this.newGuestMenu, 'add guests');
        //add
        this.guestsToAdd = obj('div', ['guestsToAdd'], this.newGuestMenu, "");
        alunos.forEach(guest => {
            if (this.guests.includes(guest)) return
            //
            const add = obj('button', [], this.guestsToAdd, `${guest.nome} ${guest.sobrenome}`), img = obj('img', ['addUserImg'], add, "");
            img.src = guest.img;
            add.onclick = () => {
                this.guests.push(guest);
                add.parentNode.removeChild(add);
                // handle guests
                document.querySelectorAll('.guestInList, .addGuest').forEach(e => e.parentNode == this.guestList && e.parentNode.removeChild(e))
                this.addGuest = obj('button', ['material-symbols-outlined', 'addGuest'], this.guestList, 'person_add');
                this.addGuest.onclick = () => this.newGuestMenu.disp = 'flex';
                //
                this.guests.forEach(guest => this.addGuest(guest));
                //atualizar para verção posts
                // o que isso deveria fazer?
                fetch('/save_data', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }).then().catch(error => console.error('Erro ao enviar os dados:', error));
            }
        })
    }
    addGuest(guest) {
        // there sould be a better way to do this
        const guestInList = obj('button', ['guestInList'], this.guestList, guest.nome + ' ' + guest.sobrenome),
            guestInfo = obj('div', ['guestInfo'], guestInList, ""),
            guestInListImg = obj('img', [], guestInList, ""),
            removeGuest = obj('p', ['removeGuest', 'material-symbols-outlined'], guestInfo, "person_remove"),
            toAdm = obj('p', ['tornarAdm', 'material-symbols-outlined'], guestInfo, "");
        //
        guestInList.addEventListener('contextmenu', e => {
            e.preventDefault();
            guestInfo.disp = 'flex';
            guestInList.addEventListener('mouseleave', () => guestInfo.disp = '');
        });
        obj('img', [], obj('div', [], guestInfo, `${guest.nome} ${guest.sobrenome}`), "").src = guest.img;
        //email
        this.guestEmail = obj('span', ['email'], guestInfo, guest.email);
        this.guestEmail.title = 'copy';
        // copy the email
        this.guestEmail.onclick = () => navigator.clipboard.writeText(guest.email) || console.error('Erro ao copiar texto');
        //
        guestInListImg.src = guest.img;
        //remove guest
        removeGuest.onclick = () => confirm(user == guest ? 'deseja sair do grupo?' : `deseja remover ${guest.nome} do grupo?`) && removeGuestFn(guest);
        //
        toAdm.innerText = this.adm.includes(guest) ? 'gpp_bad' : 'shield_person';
        toAdm.onclick = () => {
            if (!this.adm.includes(user)) return
            // the user is an ADM
            toAdm.innerText = this.adm.includes(guest) ? 'gpp_bad' : 'shield_person';
            //
            if (this.adm.includes(guest)) {
                this.adm.splice(this.adm.indexOf(guest), 1);
                return
            }
            this.adm.push(guest);
        }
    }
    removeGuestFn(guest) {
        guestInList.parentNode.removeChild(guestInList);
        this.guests.splice(this.guests.indexOf(guest), 1); //preciso adicionar o usuario removido para "add guests" novamente
        if (this.adm.indexOf(guest) != -1) this.adm.splice(this.adm.indexOf(guest), 1);
    }
    editGroup() {
        //edit group img
        this.img = obj('img', ['groupImg', 'chatImg'], this.chatConfig, "");
        this.img.src = this.thumb;
        //
        this.imgInput = obj("input", [], this.chatConfig, "");
        this.imgInput.type = 'file';
        this.imgInput.accept = "image/svg+xml";
        this.imgInput.disp = 'none';
        //this.picMenuOff.element.addEventListener('click',()=> this.picMenuOff.element.disp = "none");
        this.picMenu = obj('div', ['picMenu'], this.chatConfig, "");
        this.buttons = [
            { name: 'picMenuUpload', ico: 'upload' },
            { name: 'picMenuCam', ico: 'photo_camera' },
            { name: 'picMenuNew', ico: 'add' },
            { name: 'picMenuEdit', ico: 'edit' },
            { name: 'picMenuDel', ico: 'delete' }
        ];
        this.buttons.forEach(btn => this[btn.name] = obj('button', ['picMenuBtn', 'material-symbols-outlined'], this.picMenu, btn.ico));
        document.addEventListener('click', e => {
            e.stopPropagation();
            this.picMenu.disp = (!this.picMenu.contains(e.target) && e.target !== this.picMenu && e.target !== this.img) ? '': 'none';
        })
        this.img.addEventListener('click', () => {
            this.picMenu.disp = "flex";
            this.picMenu.style.top = `calc(50% - ${this.picMenu.offsetHeight / 2}px)`;
            this.picMenu.style.left = `calc(50% - ${this.picMenu.offsetWidth / 2}px)`;
            //comando para fechar o menu
        });
        //foto
        this.capture = obj('video', ['picMenuVidCap'], this.picMenu, "");
        this.capture.autoplay = true;
        this.CaptureBtn = obj('button', ['vidCapBtn', 'picMenuVidCap', 'material-symbols-outlined'], this.picMenu, "add_a_photo");
        this.picMenuCanvas = obj('canvas', ['picMenuCanvas'], this.picMenu, "");
        this.picMenuCanvas.height = "300";
        this.picMenuCanvas.width = "400";
        // picMenuCam does exist, don't worry
        this.picMenuCam.addEventListener('click', () => {
            // veryfy if the user has an identificable camera
            if (!navigator.mediaDevices && !navigator.mediaDevices.getUserMedia) throw Error("no media device founded!");
            // record and stream
            navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                Array.from(document.getElementsByClassName('picMenuVidCap')).forEach(e => e.disp = "flex");
                Array.from(document.getElementsByClassName('picMenuBtn')).forEach(e => e.disp = "none");
                // stream
                this.capture.srcObject = stream;
                // align in center
                this.picMenu.style.top = this.picMenu.style.left = `50%`;
                this.picMenu.style.transform = 'translate(-50%, -50%)';
                //
            }).catch(err => Error("Erro ao acessar a câmera: ", err));
            //
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
            //
            this.picMenu.disp = "none";
            if (!e.target.files[0].type.startsWith('image/svg+xml')) throw Error("não é uma imagem tipo svg!")
            //
            const reader = new FileReader();
            reader.readAsDataURL(e.target.files[0]);
            reader.onload = () =>  this.changeImg();
        })
        //Criar editor svg com animações pre-definidas e por script
        //rename group
        this.rename = obj('input', ['renameGroup'], this.chatConfig, 'rename');
        this.rename.type = "text";
        this.rename.spellcheck = false;
        this.rename.value = this.name;
        this.rename.addEventListener("paste", e => {
            const c = e.clipboardData || window.Clipboard;
            if (!c.getData("text").length + this.rename.value.length > 20) return
            //
            e.preventDefault();
            // Todo: colar só o suficiente no input
            alert('texto muito grande, você só tem mais ' + (20 - this.rename.value.length) + ' caracteres até o limite');
        });
        this.rename.addEventListener("keydown", e => {
            const keyList = [37, 39, 46, 9, 8, 116].includes(e.keyCode);
            // review
            if (this.rename.value.length > 20 && !keyList && this.rename.selectionStart == this.rename.selectionEnd) {
                e.preventDefault();
            }
            if (e.keyCode != 13) return // if the pressed key is not enter return
            //
            e.preventDefault();
            this.renameGroup();
        });
        this.rename.onblur = () => this.renameGroup();
        this.rename.addEventListener('drop', e => e.preventDefault());
        this.desc = obj('input', ['groupDesc'], this.chatConfig, 'description');
        //del group
        this.delete = obj('button', ['deleteGroup', 'material-symbols-outlined'], this.chatConfig, 'delete');
        this.delete.title = 'burn everything';
        // maybe create a custom function with a custom popup for 'confirm'...
        this.delete.onclick = () => confirm("deseja apagar este grupo?") && this.deleteGroup();
    }
    changeImg() {
        this.thumb = reader.result;
        //
        this.thumbBtnImg.src = this.img.src = this.thumbPicture.src = this.thumb;
        saveData(JSON.stringify({
            type: "EDIT",
            target: "chats",
            column: "img",
            value: c.thumb,
            id: this.id.replace(/^chat:\s*/, "")
        }))
    }
    deleteGroup() {
        ["chatElement", "chatConfig", "thumbnail"].forEach(e => this[e].parentNode.removeChild(this[e]))
        chats.splice(this.id - 1, 1);
        //server DB
        saveData(JSON.stringify({
            type: "DELETE",
            target: "chats",
            id: this.id.replace(/^chat:\s*/, "")
        }))
    }
    renameGroup() {
        if (this.rename.value != this.name && this.rename.value.replace(/^\W+/, '') == '') {
            this.rename.value = this.name;
            throw Error("You can't rename the group to an empty value!");
        }
        //
        this.thumbDiv.childNodes[2].nodeValue = this.thumbnail.firstChild.nodeValue = this.name = this.rename.value;
        this.rename.value = this.rename.value.replace(/^\W+/, '');
        //
        saveData(JSON.stringify({
            type: "EDIT",
            target: "chats",
            column: "name",
            value: this.rename.value,
            id: this.id.replace(/^chat:\s*/, "")
        }))
        //corrigir bugs de renomeio muito rapido (0.3sec), aplicar delay para mostrar o pop-up
        //mudar a mensagem do pop-up caso haja um erro como "erro ao enviar os dados"
        popup.innerText = "Grupo Renomeado!";
        popup.disp = "flex";
        popup.style.top = '0';
        popup.style.left = `calc(50% - ${popup.offsetWidth / 2}px)`;
        setTimeout(() => {
            popup.style.top = '-20%';
            popup.addEventListener('transitionend', () => popup.disp = "")
        }, 3000)
    }
    Msgs() {
        this.msgArea = obj('div', ['msgArea'], this.chatElement, "");
        //scroll to the bottom
        this.toBottom = obj('button', ['toBottom', 'material-symbols-outlined'], this.msgArea, 'arrow_downward');
        this.msgArea.onscroll = () => this.toBottom.disp = (this.msgArea.scrollTop < this.msgArea.scrollHeight - 800) ? "block" : "none";
        this.toBottom.onclick = () => this.msgArea.scrollTop = this.msgArea.scrollHeight;
        //file preview
        this.inputChat = obj('div', ['inputChat'], this.chatElement, "");
        this.previewSlides = obj('div', ['previewSlides'], this.inputChat, "");
        this.previewArrowBackward = obj('button', ['material-symbols-outlined', 'previewArrow'], this.inputChat, 'arrow_back_ios_new');
        this.previewArrowFoward = obj('button', ['material-symbols-outlined', 'previewArrow'], this.inputChat, 'arrow_forward_ios');
        this.previewArrowFoward.style.left = '95%';
        //msgBallon
        //adicionar corretor automatico e sujestão de palavras
        //Ao começar a digitar, primeira letra em maiusculo (exeto quando o shift está ativado)
        //adicionar menu de emojis e codigos de emojis (#-EMOJI-#) 
        this.msgBalloon = obj('textarea', ['msgBalloon'], this.inputChat, "");
        this.msgBalloon.placeholder = 'vontade de falar...';
        this.attach = obj('button', ['attach', 'material-symbols-outlined'], this.inputChat, "attach_file");
        //audio recorder
        //gravação de audio
        //recursos de legendas para quem não puder ouvir o audio
        this.inputAudio = obj('button', ['material-symbols-outlined', 'inputAudio'], this.inputChat, 'mic');
        let transferfiles = [], record = true;
        this.inputAudio.onclick = () => {
            // review: this makes me uncomfortable
            if (record) {
                this.inputAudio.classList.add("recordingAudio");
                this.inputAudio.innerText = "stop_circle";
                this.attach.disp = "none";
                this.msgBalloon.disabled = true;
                record = false;
                return
            }
            this.inputAudio.classList.remove("recordingAudio");
            this.inputAudio.innerText = "mic";
            this.attach.disp = "inline-block";
            this.msgBalloon.disabled = false;
            record = true;
        }
        this.msgBalloon.addEventListener('drop', e => { //drop não funciona em this.msgArea, pesquisar o motivo e corrigir
            e.preventDefault();
            if (e.dataTransfer.files.length > 1) {
                this.previewArrowFoward.disp = this.previewArrowBackward.disp = 'inline';
                this.previewArrowFoward.addEventListener('click', () => changeSlide(i + 1, this.previewSlides));
                this.previewArrowBackward.addEventListener('click', () => changeSlide(i - 1, this.previewSlides));
            }
            for (const dataFile of e.dataTransfer.files) {
                //
                const reader = new FileReader();
                //
                reader.readAsDataURL(dataFile);
                reader.onload = e => {
                    //
                    const dt = dataFile.type;
                    //
                    const file = {
                        "image/": () => {
                            this.preview = obj('img', [], this.previewSlides, "");
                            this.preview.src = e.target.result;
                        },
                        "audio/": () => {
                            this.preview = obj('audio', [], this.previewSlides, "");
                            this.preview.load();
                            this.preview.src = e.target.result;
                            //
                            throw Error("unimplemented!");
                        },
                        "video/": () => {
                            //lidar com videos usando a API do youtube
                            this.preview = obj('video', [], this.previewSlides, "");
                            this.preview.load();
                            this.preview.src = e.target.result;
                        },
                    }
                    file[dt.replace(/\/\w*/, '/')]?.();
                    //
                    this.preview.disp = 'none';
                    this.previewSlides.disp = 'flex';
                    this.previewSlides.childNodes[0].disp = 'block';
                    this.preview.controls = true;
                    transferfiles.push(this.preview)
                }
            }
            let i = 0;
            function changeSlide(index, e) {
                if (index > e.childNodes.length && index <= 0) return
                // pause videos / audios
                if (e.childNodes[i].nodeName == 'VIDEO' || e.childNodes[i].nodeName == 'AUDIO') e.childNodes[i].pause();
                //
                e.childNodes[i].disp = 'none';
                i = index;
                e.childNodes[i].disp = 'block';
            }
        });

        this.msgBalloon.addEventListener('keydown', e => {
            // review: revert this nesting
            if (e.key != 'Enter' || e.shiftKey) {
                return
            }
            e.preventDefault();
            //
            if (this.msgBalloon.value.replace(/^\s+/, "").replace(/[\u200E\s⠀ㅤ]/g, "") != '' || transferfiles.length != 0) {
                // fix the issue before adding this back:
                //this.preview.parentNode.removeChild(this.preview);
                this.inputChat.style.height = '';
                this.previewSlides.disp = '';
                this.msgs.push(new msg(this.msgBalloon.value, transferfiles, new Date(), user, this));
            }
        });
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

export { chats, alunos, user, chat }

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
    //
    get getMsg() { return this.msg }
    //
    Msgs() {
        //Adicionar opção de editar
        this.chat.msgBalloon.value = '';
        this.msg = obj('div', ['msg', 'sended'], this.chat.msgArea, "");
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
            // style
            //console.log(msgContext);
            msgContext.disp = 'flex';
            msgContext.style.left = `calc(${e.screenX}px - ${msgContext.offsetWidth / 2}px)`;
            msgContext.style.top = `calc(${e.clientY}px)`;
        })
        //
        document.addEventListener('contextmenu', e => msgContext.disp = (e.target.classList != 'msgContext') ? '' : 'none');
        //
        msgContext.addEventListener('contextmenu', e => {
            e.preventDefault()
            e.stopPropagation()
        });
        //owner
        this.msgTop = obj('div', ['msgTop'], this.msg, "");
        // talves um metodo similar ao Some() e None() do rust poderia funcionar
        const LAST_MSG = this.chat.msgs.length > 0 ? this.chat.msgs[this.chat.msgs.length - 1] : null;
        // review
        if (LAST_MSG && LAST_MSG.owner == user) {
            LAST_MSG.msg.style.borderBottomRightRadius = "0.3rem";
            this.msg.classList.add('msgList');
        } else {
            this.msgTop.style.marginBottom = "5px";
            this.msgOwnerPic = obj('img', ['msgOwnerPic'], this.msgTop, "");
            this.msgOwner = obj('p', ['msgOwner'], this.msgTop, `${this.owner.nome} ${this.owner.sobrenome}`);
            this.msgOwnerPic.src = this.owner.img;
        }
        //
        this.msgDate = (LAST_MSG && LAST_MSG.time != this.time || this.chat.msgs.length == 0) ? obj('p', ['msgDate'], this.msgTop, this.time, "") : null;
        //
        this.filePlaceHolder = obj('div', ['filePlaceholder'], this.msg, "");
        // file --> carregamento de novas mensagens.
        // O carregamento de arquivos em mensagens antigas deve ser feito dentro da classe msg, pois não há previsualização do envio.
        // Todo: create a better way to do this
        if (this.file) {
            this.file.forEach(file => {
                file.disp = 'flex'
                // Todo: create your own way to handle audio files
                if (file.tagName.toLowerCase() == "audio") {
                    throw Error("unimplemented!");
                }
                this.filePlaceHolder.appendChild(file);
                return
            })
        }
        this.filePlaceHolder.disp = (this.filePlaceHolder.childElementCount == 0) ? 'none' : '';
        //emails e links
        const emails = this.content.match(/\b[A-Za-z0-9._%+-ãçõ]+@[A-Za-z0-9.-ã]+\.[A-Za-z]{2,}\b/g),
              links = this.content.match(/https?:\/\/\S+/gi);
        // Todo: add more MD rules
        const formatRules = [
            { regex: /(\*\*)(.*?)(\*\*)/g, tag: 'strong' },
            { regex: /(\*)(.*?)(\*)/g, tag: 'i' },
            { regex: /(\~~)(.*?)(\~~)/g, tag: 'a', style: 'text-decoration: line-through 2px;' }
        ];
        // verify if it does have any email or url
        // maybe this could be done in a way similar of the 'https://lunacookies.github.io/lang/1/'
        if (emails) emails.forEach(m => this.content = this.content.replace(m, `<a href="mailto:${m}" title="email" target="_blank">${m}</a>`));
        if (links) links.forEach(l => this.content = this.content.replace(l, l.link(l)));
        //text decorations
        for (const rule of formatRules) {
            this.content = this.content.replace(rule.regex, (match, p1, p2, p3) => {
                const l = p2.startsWith(' ') ? '&nbsp;' : '',
                      t = p2.endsWith(' ') ? '&nbsp;' : '';
                p2 = p2.trim().replace(/\s+/g, ' '); // Substitui múltiplos espaços por um único espaço
                return `<${rule.tag} ${rule.style ? `style='${rule.style}'` : ''}>${l}${p2}${t}</${rule.tag}>`;
            });
        }
        // this is not mandatory, is just an option
        //bad words
        //let bannedWordsRegex = new RegExp(this.chat.bannedWords.join("|"), "gi");
        //this.content = sinonimos(binaryToText(this.content)).replace(bannedWordsRegex, matchedWord => '*'.repeat(matchedWord.length));
        //Text Content
        this.msgTextContent = obj('span', ['msgTextContent'], this.msg, "");
        this.msgTextContent.innerHTML = this.content;
    }
    readTextFile() {
        const reader = new FileReader();
        //
        reader.readAsText(this.file);
        reader.onload = e => {
            const result = e.target.result;
            // this should be reviewed
            const plainText = {
                "text/html": () => {
                    this.htmlFileElement = obj('a', ['htmlFileBtn'], this.filePlaceHolder, this.file.name);
                    this.htmlFileElement.href = URL.createObjectURL(new Blob([result], { type: 'text/html' }));
                    this.htmlFileElement.target = '_blank';
                },
                "text/plain": () => this.filePlaceHolder.innerText = result,
                // text markdown
                // json
            }
            plainText[this.file.type]?.();
        }
    }
}