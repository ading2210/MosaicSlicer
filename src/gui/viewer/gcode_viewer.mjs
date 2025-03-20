// Viewer interactions (eg. clicking on a model, etc.)
import * as renderer from "./renderer.mjs";
import * as viewer from "./viewer.mjs";
import * as gcode from "./gcode.mjs";
import { active_containers } from "../../settings/index.mjs";

export async function start_gcode_viewer() {
  viewer.start_viewer();
  console.log("loading");
  let res = await fetch("/boat.gcode");

  let mesh = gcode.parse(await res.text());

  let machine_settings = active_containers.containers.global.definition.settings.machine_settings.children;
  mesh.position.set(
    -machine_settings.machine_width.default_value / 2,
    0,
    machine_settings.machine_width.default_value / 2
  );

  renderer.scene.add(mesh);
}
