fn main()
{
	println!("cargo::rustc-check-cfg=cfg(android_platform)");
	println!("cargo::rustc-check-cfg=cfg(macos_platform)");
	println!("cargo::rustc-check-cfg=cfg(web_platform)");
}