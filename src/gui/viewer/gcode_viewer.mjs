// Viewer interactions (eg. clicking on a model, etc.)
import * as THREE from "three";
import * as renderer from "./renderer.mjs";
import * as viewer from "./viewer.mjs";
import * as gcode from "./gcode/parser.mjs";
import { LineTubeGeometry } from "./gcode/LineTubeGeometry.mjs";
import { active_containers } from "../../settings/index.mjs";
import { tab_change_listeners } from "../tabs.mjs";
import { exported_gcode } from "../slicer.mjs";
import { notify } from "../notifications.mjs";

const scene = new THREE.Scene();

let gcode_mesh;

export function start_gcode_viewer() {
  viewer.setup_scene(scene);
}

export function clear_gcode() {
  if (gcode_mesh) {
    scene.remove(gcode_mesh);
    gcode_mesh = null;
  }
}

async function show_gcode_viewer() {
  if (!gcode_mesh) {
    if (exported_gcode) {
      console.log("parsing");

      let mesh = new THREE.Group();
      let parsed_data = await gcode.parse(exported_gcode);

      for (let layer of parsed_data) {
        let layer_lines = new THREE.Group();
        let current_line = new LineTubeGeometry(3);
        for (let point of layer) {
          if (point.type == "travel") {
            if (current_line.pointsLength > 0) {
              current_line.finish();

              layer_lines.add(
                new THREE.Mesh(
                  current_line,
                  new THREE.MeshPhysicalMaterial({
                    color: 0x1a5f5a,
                    // A bit of constant light to dampen the shadows
                    emissive: 0x1a5f5a,
                    emissiveIntensity: 0.3
                  })
                )
              );
              current_line = new LineTubeGeometry(3);
            }
          }
          else {
            current_line.add({point: point.vector, color: new THREE.Color(0xff0f00), radius: 0.1});
          }
        }
        mesh.add(layer_lines);
      }

      let machine_settings = active_containers.containers.global.definition.settings.machine_settings.children;
      mesh.position.set(
        -machine_settings.machine_width.default_value / 2,
        0,
        machine_settings.machine_width.default_value / 2
      );
      mesh.rotation.set(-Math.PI / 2, 0, 0);

      scene.add(mesh);
      gcode_mesh = mesh;
    }
    else {
      notify("No G-Code to show", "Slice a model to generate G-Code");
    }
  }
}

tab_change_listeners.push((i) => {
  if (i == 1) {
    renderer.set_scene(scene);
    show_gcode_viewer();
  }
});
