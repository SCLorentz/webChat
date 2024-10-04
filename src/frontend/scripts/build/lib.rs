// the UUIDs won't be generated using SQLite, they will be generated in Rust. That will provide a better IDs system.
use uuid::Uuid;
use wasm_bindgen::prelude::*;
// http response
/*use web_sys::Request;
use web_sys::RequestInit;
use web_sys::Response;*/

use serde::{Serialize, Deserialize}; // Para serialização
use chrono::Utc; // Para manipulação de data e hora

extern crate web_sys;
//use web_sys::console;

#[wasm_bindgen]
extern {
    pub fn confirm(s: &str) -> bool;
}

/*#[wasm_bindgen]
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
}*/

/*#[wasm_bindgen]
pub async fn fetch_data(url: &str) -> Result<String, JsValue> {
    let mut opts = RequestInit::new();
    opts.method("GET");

    let request = Request::new_with_str_and_init(url, &opts)?;

    let window = web_sys::window().expect("no global `window` exists");
    let response: Response = JsFuture::from(window.fetch_with_request(&request)).await?.into();

    if !response.ok() {
        Err(JsValue::from_str("Failed to fetch data"))
    }
    
    let text = JsFuture::from(response.text()?).await?;
    Ok(text.as_string().unwrap_or_default())
}*/

#[wasm_bindgen]
pub fn id() -> String {
    return Uuid::new_v4().to_string();
}

// serio, eu vou chorar fazendo essa porra. Que merda
// serio, eu estou começando a odiar mais do que só o JS.
// TS até tem types, mas que porra, como assim o sistema de types deixa eu fazer qualquer merda sem problemas?
// Eu quero rigidez

#[derive(Serialize, Deserialize, Clone, Debug)]
#[wasm_bindgen]
pub struct Message {
    id: String,
    sender: Person,
    timestamp: u64,
    favorited: bool,
    text: String,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
#[wasm_bindgen]
pub struct Person {
    id: String, // Use String para o UUID
    name: String,
    img: Option<String>, // Use Option<String> para permitir que seja None (equivalente a undefined)
}

#[wasm_bindgen]
pub fn wasm_message(text: String, sender: Person) -> Message {
    return Message {
        id: id(),
        sender,
        timestamp: Utc::now().timestamp() as u64,
        favorited: false,
        text
    }
}