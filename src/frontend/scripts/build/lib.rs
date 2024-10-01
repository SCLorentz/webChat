// the UUIDs won't be generated using SQLite, they will be generated in Rust. That will provide a better IDs system.
use uuid::Uuid;
use wasm_bindgen::prelude::*;

extern crate web_sys;
//use web_sys::console;

#[wasm_bindgen]
extern {
    pub fn confirm(s: &str) -> bool;
}

/*#[wasm_bindgen]
pub fn greet(name: &str) {
    console::log_1(&JsValue::from_str("Hello, world!"));
    //
    if confirm(&format!("Are you sure?")) {
        console::log_1(&JsValue::from_str(&format!("fuck you {}!", name)));
        return;
    }
    //
    console::log_1(&JsValue::from_str("You are not sure :("));
}*/

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

#[wasm_bindgen]
pub fn id() -> String {
    return Uuid::new_v4().to_string();
}