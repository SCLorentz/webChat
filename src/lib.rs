use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern {
    pub fn alert(s: &str);
    pub fn confirm(s: &str) -> bool;
}

#[wasm_bindgen]
pub fn greet(name: &str) {
    if confirm(&format!("Are you sure?")) {
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

/*#[wasm_bindgen(start)]
fn run() -> Result<(), JsValue> {
    // Use `web_sys`'s global `window` function to get a handle on the global
    // window object.
    let window = web_sys::window().expect("no global `window` exists");
    let document = window.document().expect("should have a document on window");
    let _body = document.body().expect("document should have a body");

    // Manufacture the element we're gonna append
    let val = document.create_element("p")?;
    val.set_text_content(Some("Hello from Rust!"));
    
    let contatos = document.get_element_by_id("contatos");
    contatos.unwrap().append_child(&val)?;

    Ok(())
}*/