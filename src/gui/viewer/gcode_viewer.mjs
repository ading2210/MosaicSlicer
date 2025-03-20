// Viewer interactions (eg. clicking on a model, etc.)
import * as THREE from "three";
import * as renderer from "./renderer.mjs";
import * as viewer from "./viewer.mjs";
import * as gcode from "./gcode.mjs";
import { active_containers } from "../../settings/index.mjs";
import { tab_change_listeners } from "../tabs.mjs";
import { exported_gcode } from "../actions.mjs";
import { notify } from "../notifications.mjs";

const scene = new THREE.Scene();

export function start_gcode_viewer() {
  viewer.setup_scene(scene);
}

function show_gcode_viewer() {
  if (exported_gcode) {
    let mesh = gcode.parse(exported_gcode);

    let machine_settings = active_containers.containers.global.definition.settings.machine_settings.children;
    mesh.position.set(
      -machine_settings.machine_width.default_value / 2,
      0,
      machine_settings.machine_width.default_value / 2
    );

    scene.add(mesh);
  }
  else {
    notify("No G-Code to show", "Slice a model to generate G-Code");
  }
}

tab_change_listeners.push((i) => {
  if (i == 1) {
    renderer.set_scene(scene);
    show_gcode_viewer();
  }
});
