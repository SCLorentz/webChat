import { compile } from "https://x.nest.land/sass@0.2.0/mod.ts";

compile("a { color: #000; }", {
  output_style: "nested",
  precision: 5,
  indented_syntax: false,
  include_paths: []
}).result;