// Viewer interactions (eg. clicking on a model, etc.)
import * as THREE from "three";
import * as renderer from "./renderer.mjs";
import * as viewer from "./viewer.mjs";
import * as gcode from "./gcode.mjs";

export async function start_gcode_viewer() {
  viewer.start_viewer();
  console.log("loading");
  let res = await fetch("/boat.gcode");
  console.log(gcode.parse(await res.text()));
}
