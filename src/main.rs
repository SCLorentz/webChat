//use winit::event_loop::ControlFlow;
//use winit::event_loop::EventLoop;
//use std::env;
use log::info;

mod login;
#[allow(unused)]
use login::Cli;

mod app;
mod gui;
mod renderer;
use app::App;

#[tokio::main]
async fn main() -> anyhow::Result<()>
{
	colog::init();
	log_panics::init();
	info!("starting program");
	//let args: Vec<String> = env::args().collect();
	
	let _ = App::init();

	Ok(())
}