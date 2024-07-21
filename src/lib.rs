// the UUIDs won't be generated using SQLite, they will be generated in Rust. That will provide a better IDs system.
extern crate uuid;
use uuid::Uuid;

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern {
    pub fn alert(s: &str);
    pub fn confirm(s: &str) -> bool;
}

#[wasm_bindgen]
pub fn greet(name: &str) {
    if confirm(&format!("Are you sure? {}", Uuid::new_v4())) {
        alert(&format!("You are sure! {}", name));
    } else {
        alert("You are not sure :(");
    }
}

#[wasm_bindgen]
pub fn obj(ty: String, classes: Vec<String>, father: web_sys::Document, txt: String) -> Result<(), JsValue> {
    let window = web_sys::window().expect("no global `window` exists");
    let document = window.document().expect("should have a document on window");
    let _body = document.body().expect("document should have a body");

    // Manufacture the element we're gonna append
    let val = document.create_element(&ty)?;
    val.set_text_content(Some(&txt));

    // set classes
    val.set_class_name(&classes.join(" "));

    //et contatos = document.get_element_by_id(father);
    father.append_child(&val)?;

    Ok(())
}

/*#[wasm_bindgen]
struct Chat {
    // criar um type personalizado para IDs
    id: String,
    name: String,
    // base64 de imagem
    thumb: String,
    guests: Vec<String>,
    adms: Vec<String>,
    msgs: Vec<String>,
}

#[wasm_bindgen]
impl Chat {
    // constructor
    pub fn new(id: &str, name: &str, thumb: &str, guests: Vec<String>, adms: Vec<String>) -> Self {
        let id = format!("chat:{}", id);
        let msgs = Vec::new();
        
        let mut chat = Chat {
            id,
            name: name.to_string(),
            thumb: thumb.to_string(),
            guests,
            adms,
            msgs,
        };

        chat.build();               // handle chat creation
        chat.settings();            // handle chat configurations
        chat.msgs();                // handle messages
        
        chat
    }
    // functions
    fn build(&mut self) {
        //
        let window = web_sys::window().expect("no global `window` exists");
        let document = window.document().expect("should have a document on window");
        let body = document.body().expect("document should have a body");
        // generate id
        self.id = format!("chat:{}", Uuid::new_v4());
        // generate name
        self.name = format!("Chat {}", self.name);
        // generate base for the chat
        //obj("div".to_string(), vec![format!("chat_{}", self.id.clone())], document.body, format!("Chat {}", self.name));
        // generate thumb
        //obj("img", vec![format!("img_{}",self.id.clone())], self.thumb.clone());
    }
    fn settings(&mut self) {
        // buold chat configurations
        //obj("div".to_string(), vec![format!("chat_{}", self.id.clone())], body);
    }
    fn msgs(&mut self) {
        // Implementation of msgs
    }
}*/

// this is executed once when the wasm module is loaded
// #[wasm_bindgen(start)] <-- this is necessary to run the function in the start of the wasm module