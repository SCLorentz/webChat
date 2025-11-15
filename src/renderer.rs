use winit::window::{Window, WindowId, Theme};
use std::mem;

use std::{
	error::Error,
	fs,
	sync::Arc,
	hash::Hash,
	//ffi::{CStr, CString},
};

#[allow(unused)]
use log::{info, warn, debug};

use skia_safe::{
	surfaces,
	Color,
	Data,
	Font,
	Paint,
	Surface,
	FontMgr,
	Image,
	EncodedImageFormat,
	Path,
	PaintStyle,
	//gpu::{self, gl::{self, Interface}},
};

/*use glutin::{
    config::ConfigTemplateBuilder,
    display::{Display, GlDisplay},
    surface::{SurfaceAttributesBuilder, WindowSurface},
    context::{ContextAttributesBuilder, PossiblyCurrentContext, NotCurrentGlContext},
};

use glutin_winit::DisplayBuilder;*/

#[allow(unused)]
#[derive(Clone)]
pub struct RendererCtx
{
	surface:	Surface,
	window_id:	WindowId,
	path: 		Path,
	paint:		Paint,
	font:		Font,
	//
	bg_color:	Color,
	fg_color:	Color,
}

impl Hash for RendererCtx
{
	fn hash<H: std::hash::Hasher>(&self, state: &mut H)
	{
		self.window_id.hash(state);
	}
}

impl PartialEq for RendererCtx
{
	fn eq(&self, other: &Self) -> bool
	{
		self.window_id == other.window_id
	}
}

impl Eq for RendererCtx {}

// https://github.com/rust-skia/rust-skia/blob/235bd3bd89febbfc6e65f3105bf0ef908a2f9d82/skia-safe/examples/gl-window/main.rs
impl RendererCtx
{
	pub fn default(window: Arc<Window>) -> Self
	{
		let (fg_color, bg_color) = match Window::theme(&window) {
			None | Some(Theme::Light)	=> (Color::BLACK, Color::WHITE),
			Some(Theme::Dark)			=> (Color::WHITE, Color::BLACK),
		};
		
		debug!("theme: {:?}", Window::theme(&window).unwrap_or(Theme::Light));

		let (width, height) = Self::get_proportion(&window);
		
		#[allow(deprecated)]
		let mut surface = surfaces::raster_n32_premul((width, height))
			.expect("Something went wrong while creating a surface!");

		let path = Path::new();
		let mut paint = Paint::default();
		paint.set_color(fg_color);
		paint.set_anti_alias(true);
		paint.set_stroke_width(1.0);
		surface.canvas().clear(bg_color);
		
		// Maybe??
		/*let font_kit_font = SystemSource::new()
			.select_best_match(&[FamilyName::SansSerif], &Properties::new())
			.unwrap()
			.load()
			.unwrap();*/

		let font_file = fs::read(Self::default_font_path())
			.or_else(|_| {
				warn!("default font file not found, skipping");
				fs::read("Roboto-LightItalic.ttf")
			})
			.expect("Error while setting up font");

		let font_data = Data::new_copy(&font_file);

		let font_mgr = FontMgr::new();
		let typeface = font_mgr
			.new_from_data(&font_data, None)
			.expect("Error while loading font!");

		let mut font = Font::default();
		font.set_size(32.0);
		font.set_typeface(typeface);
		font.set_edging(skia_safe::font::Edging::SubpixelAntiAlias);

		Self {
			window_id: window.id(),
			surface,
			path,
			paint,
			font,
			fg_color,
			bg_color,
		}
	}
	
	#[allow(unused)]
	pub fn new(&mut self)
	{
		// https://github.com/zfedoran/skia-examples/blob/main/example-1/src/main.rs
		let canvas = self.surface.canvas();
		canvas.draw_str("hello, world", (50, 50), &self.font, &self.paint);
		
		Self::screenshot(self, "output.png");

		//self.surface.flush_and_submit();
	}
	
	fn screenshot(&mut self, f_name: &str) -> Result<(), Box<dyn Error>>
	{
		debug!("taking screenshot");
		let image_data = Image::encode(
				&self.surface.image_snapshot(),
				None,
				EncodedImageFormat::PNG,
				100
			)
			.ok_or("Failed to encode image")?;

		fs::write(f_name, image_data.as_bytes())?;

		Ok(())
	}
	
	// HELPER FUNCTIONS ----

	fn get_proportion(window: &Arc<Window>) -> (i32, i32)
	{
		let size = window.inner_size();
		(size.width.max(1) as i32, size.height.max(1) as i32)
	}
	
	#[cfg(target_os = "macos")]
	fn default_font_path() -> &'static str
	{
		"/System/Library/Fonts/Supplemental/Arial.ttf"
	}
	
	#[cfg(target_os = "linux")]
	fn default_font_path() -> &'static str
	{
		"/usr/local/share/fonts/Arial.ttf"
	}
	
	#[cfg(target_os = "windows")]
	fn default_font_path() -> &'static str
	{
		r"C:\Windows\Fonts\Arial.ttf"
	}

	#[allow(unused)]
	#[inline]
	pub fn save(&mut self)
	{
		self.canvas().save();
	}

	#[allow(unused)]
	#[inline]
	pub fn translate(&mut self, dx: f32, dy: f32)
	{
		self.canvas().translate((dx, dy));
	}

	#[allow(unused)]
	#[inline]
	pub fn scale(&mut self, sx: f32, sy: f32)
	{
		self.canvas().scale((sx, sy));
	}

	#[allow(unused)]
	#[inline]
	pub fn move_to(&mut self, x: f32, y: f32)
	{
		self.begin_path();
		self.path.move_to((x, y));
	}

	#[allow(unused)]
	#[inline]
	pub fn line_to(&mut self, x: f32, y: f32)
	{
		self.path.line_to((x, y));
	}

	#[allow(unused)]
	#[inline]
	pub fn quad_to(&mut self, cpx: f32, cpy: f32, x: f32, y: f32)
	{
		self.path.quad_to((cpx, cpy), (x, y));
	}

	#[allow(dead_code, unused)]
	#[inline]
	pub fn bezier_curve_to(&mut self, cp1x: f32, cp1y: f32, cp2x: f32, cp2y: f32, x: f32, y: f32)
	{
		self.path.cubic_to((cp1x, cp1y), (cp2x, cp2y), (x, y));
	}

	#[allow(dead_code, unused)]
	#[inline]
	pub fn close_path(&mut self)
	{
		self.path.close();
	}

	#[allow(unused)]
	#[inline]
	pub fn begin_path(&mut self)
	{
		let new_path = Path::new();
		self.surface.canvas().draw_path(&self.path, &self.paint);
		let _ = mem::replace(&mut self.path, new_path);
	}

	#[allow(unused)]
	#[inline]
	pub fn stroke(&mut self)
	{
		self.paint.set_style(PaintStyle::Stroke);
		self.surface.canvas().draw_path(&self.path, &self.paint);
	}

	#[allow(unused)]
	#[inline]
	pub fn fill(&mut self)
	{
		self.paint.set_style(PaintStyle::Fill);
		self.surface.canvas().draw_path(&self.path, &self.paint);
	}

	#[allow(unused)]
	#[inline]
	pub fn set_line_width(&mut self, width: f32)
	{
		self.paint.set_stroke_width(width);
	}

	#[allow(unused)]
	#[inline]
	pub fn data(&mut self) -> Data
	{
		let image = self.surface.image_snapshot();
		let mut context = self.surface.direct_context();

		image
			.encode(context.as_mut(), EncodedImageFormat::PNG, None)
			.unwrap()
	}

	#[allow(unused)]
	#[inline]
	fn canvas(&mut self) -> &skia_safe::Canvas {
		self.surface.canvas()
	}
}