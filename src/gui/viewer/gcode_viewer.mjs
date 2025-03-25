// Viewer interactions (eg. clicking on a model, etc.)
import * as THREE from "three";
import * as renderer from "./renderer.mjs";
import * as viewer from "./viewer.mjs";
import * as gcode from "./gcode/parser.mjs";
import { active_containers } from "../../settings/index.mjs";
import { tab_change_listeners } from "../tabs.mjs";
import { exported_gcode } from "../actions.mjs";
import { notify } from "../notifications.mjs";

const scene = new THREE.Scene();

export function start_gcode_viewer() {
  viewer.setup_scene(scene);
}

async function show_gcode_viewer() {
  if (exported_gcode) {
    let parser = new gcode.GCodeParser(exported_gcode);
    await parser.parse();

    let mesh = new THREE.Group();
    for (let geometry of parser.getGeometries()) {
      mesh.add(
        new THREE.Mesh(
          geometry,
          new THREE.MeshPhysicalMaterial({
            color: 0x1a5f5a,
            // A bit of constant light to dampen the shadows
            emissive: 0x1a5f5a,
            emissiveIntensity: 0.3
          })
        )
      );
    }

    let machine_settings = active_containers.containers.global.definition.settings.machine_settings.children;
    mesh.position.set(
      -machine_settings.machine_width.default_value / 2,
      0,
      machine_settings.machine_width.default_value / 2
    );
    mesh.rotation.set(-Math.PI / 2, 0, 0);

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
