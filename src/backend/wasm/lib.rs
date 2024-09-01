// the UUIDs won't be generated using SQLite, they will be generated in Rust. That will provide a better IDs system.
use uuid::Uuid;

use wasm_bindgen::prelude::*;
use web_sys::Element;

#[wasm_bindgen]
extern {
    pub fn alert(s: &str);
    pub fn confirm(s: &str) -> bool;
}

#[wasm_bindgen]
pub fn greet(name: &str) {
    alert("Hello, world!");
    if confirm(&format!("Are you sure?")) {
        alert(&format!("fuck yourself! {}", name));
    } else {
        alert("You are not sure :(");
    }
}

#[wasm_bindgen]
pub fn obj(ty: String, classes: Vec<String>, father: web_sys::Document, txt: String) -> Result<Element, JsValue> {
    let window = web_sys::window().expect("no global `window` exists");
    let document = window.document().expect("should have a document on window");
    let _body = document.body().expect("document should have a body");

    // Manufacture the element we're gonna append
    let e = document.create_element(&ty)?;
    e.set_text_content(Some(&txt));
    // set classes
    e.set_class_name(&classes.join(" "));

    //let contatos = document.get_element_by_id(father);
    father.append_child(&e)?;

    return Ok(e);
}

#[wasm_bindgen]
pub fn id() -> String {
    return Uuid::new_v4().to_string();
}

/*#[wasm_bindgen]
pub struct Chats {
    id: i32,
    name: String,
    thumb: String,
    guests: Vec<String>,
    adms: Vec<String>,
    msgs: Vec<String>,
}

#[wasm_bindgen]
impl Chats {
    #[wasm_bindgen(constructor)]
    pub fn new(id: i32, name: String, thumb: String, guests: Vec<String>, adms: Vec<String>) -> Self {
        Chats { 
            id: id,
            name: name,
            thumb: thumb,
            guests: guests,
            adms: adms,
            msgs: Vec::new(),
        }
    }

    pub fn id(&self) -> i32 {
        self.id
    }

    pub fn set_name(&mut self, new: String) {
        self.name = new;
    }
}*/

// this is executed once when the wasm module is loaded
// #[wasm_bindgen(start)] <-- this is necessary to run the function in the start of the wasm module