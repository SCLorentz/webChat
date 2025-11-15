use winit::{
	application::ApplicationHandler,
	event::{WindowEvent, KeyEvent},
	event_loop::{ActiveEventLoop, ControlFlow, EventLoop},
	window::{Window, WindowId},
	dpi::LogicalSize,
	keyboard::PhysicalKey,
};

use std::{
	error::Error,
	sync::Arc,
	collections::HashMap,
};

use log::{info, debug};
use crate::renderer::RendererCtx;

#[cfg(target_os = "macos")]
use winit::platform::macos::WindowAttributesExtMacOS;

#[cfg(target_os = "windows")]
use winit::platform::windows::WindowAttributesExtWindows;

#[cfg(target_os = "linux")]
use gui::wayland::detect_decorations;

#[allow(unused)]
struct WindowState
{
	id:			WindowId,
	window:		Arc<Window>,
}

#[derive(Default)]
pub struct App
{
	//pub login:	Option<Cli>,
	windows:		HashMap<RendererCtx, WindowState>,
}

impl App
{
	pub fn init() -> Self
	{
		let event_loop = EventLoop::new().unwrap();
		event_loop.set_control_flow(ControlFlow::Wait);
		
		let mut app: App = App::default();
		
		//app.login = Some(Cli::try_parse().unwrap());
		let _ = event_loop.run_app(&mut app);
		
		/*let cli = Cli::try_parse().unwrap();
		debug!("{:?}", cli);
	
		if cli.verbose {
			tracing_subscriber::fmt::init();
		}
	
		login(cli.proxy).await?;*/
		
		Self {
			windows: HashMap::new(),
		}
	}
	
	pub fn new_window(&mut self, event_loop: &ActiveEventLoop, title: String) -> Result<(), Box<dyn Error>>
	{
		let mut win_attr = Window::default_attributes()
			//.with_fullscreen(Some(winit::window::Fullscreen::Borderless(None)))
			.with_title(title)
			.with_min_inner_size(LogicalSize::new(600.0, 400.0));

		#[cfg(target_os = "macos")]
		{
			win_attr = win_attr
				.with_titlebar_transparent(true)
				.with_movable_by_window_background(true)
				//.with_titlebar_buttons_hidden(true) <<-- for configs page
				.with_fullsize_content_view(true);
		}

		#[cfg(target_os = "windows")]
		{
			win_attr = win_attr
				.with_corner_preference(CornerPreference::Round); // <<-- Another option is the rounded small
		}

		/*Linux:
			with_x11_window_type([WindowType::PopupMenu]) <<-- for configs page on X11 (not avaliable for wayland)
		*/

		let window = Arc::new(
			event_loop.create_window(win_attr)?
		);
		
		let mut ctx = RendererCtx::default(window.clone());
		self.windows.insert(ctx.clone(), WindowState { id: window.id(), window: window.clone() });
		let _ = ctx.new();

		Ok(())
	}
}

impl ApplicationHandler for App
{
	fn resumed(&mut self, event_loop: &ActiveEventLoop)
	{
		info!("starting window loop");
		let _ = App::new_window(self, event_loop, String::from("Walkie-Talkie"));
	}

	#[allow(unused)]
	fn window_event(&mut self, event_loop: &ActiveEventLoop, id: WindowId, event: WindowEvent)
	{
		match event {
			WindowEvent::CloseRequested => {
				info!("Exit action by user");
				event_loop.exit();
			},
			WindowEvent::KeyboardInput {
				event: KeyEvent { physical_key: PhysicalKey::Code(code), state, .. },
				..
			} => {
				debug!("{:?} {:?}", code, state);
			}
			/*WindowEvent::RedrawRequested => {
				self.windows.as_ref().unwrap().request_redraw();
			}*/
			_ => (),
		}
	}
}