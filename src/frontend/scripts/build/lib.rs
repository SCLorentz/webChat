// the UUIDs won't be generated using SQLite, they will be generated in Rust. That will provide a better IDs system.
use uuid::Uuid;
use wasm_bindgen::prelude::*;
use wasm_bindgen::JsValue;
// http response
/*use web_sys::Request;
use web_sys::RequestInit;
use web_sys::Response;*/
extern crate web_sys;
extern crate wasm_bindgen_futures;

use wasm_bindgen_futures::JsFuture;
use web_sys::{Request, RequestInit, Response};

//use web_sys::console;

#[wasm_bindgen]
extern
{
    pub fn confirm(s: &str) -> bool;
}

/*#[wasm_bindgen]
pub fn greet(name: &str)
{
    console::log_1(&JsValue::from_str("Hello, world!"));
    //
    if confirm(&format!("Are you sure?"))
    {
        console::log_1(&JsValue::from_str(&format!("fuck you {}!", name)));
        return;
    }
    //
    console::log_1(&JsValue::from_str("You are not sure :("));
}*/

/*#[wasm_bindgen]
pub fn obj(ty: String, classes: Vec<String>, father: web_sys::Document, txt: String) -> Result<Element, JsValue>
{
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
pub fn id() -> String
{
    return Uuid::new_v4().to_string();
}

#[wasm_bindgen]
pub async fn fetch_data(url: &str) -> Result<String, JsValue>
{
    let opts = RequestInit::new();
    opts.set_method("GET");

    let request = Request::new_with_str_and_init(url, &opts)?;

    let window = web_sys::window().expect("no global `window` exists");
    let response: Response = JsFuture::from(window.fetch_with_request(&request)).await?.into();

    if !response.ok()
    {
        return Err(JsValue::from_str(&format!("Failed to fetch data: {}", response.status())));
    };
    
    let text = JsFuture::from(response.text()?).await?;
    Ok(text.as_string().unwrap_or_default())
}