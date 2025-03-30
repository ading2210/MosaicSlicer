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

// ---- Color Settings
const TRAVEL_COLOR = 0x00ffff;
const INFILL_COLOR = 0xffa500;
const SKIRT_COLOR = 0x00ffff;
const SHELL_COLOR = 0xff0000;
const INNER_COLOR = 0x00ff00;
const TOP_BOTTOM_COLOR = 0xffff00;

const color_map = {
  "FILL": INFILL_COLOR,
  "SKIRT": SKIRT_COLOR,
  "WALL-OUTER": SHELL_COLOR,
  "WALL-INNER": INNER_COLOR,
  "SKIN": TOP_BOTTOM_COLOR
};

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
        let current_line_type;
        let current_line_subtype;
        let last_point;

        function finish_line() {
          if (current_line.pointsLength > 0) {
            current_line.finish();
            layer_lines.add(
              new THREE.Mesh(
                current_line,
                new THREE.MeshPhysicalMaterial({
                  color: current_line_type == "print" ? color_map[current_line_subtype] : TRAVEL_COLOR,
                  emissive: color_map[current_line_subtype],
                  emissiveIntensity: 0.1
                })
              )
            );
            current_line = new LineTubeGeometry(3);
          }
        }

        for (let point of layer) {
          if (point.type == "travel") {
            if (current_line_type == "print")
              finish_line();

            if (current_line.pointsBuffer.length == 0) {
              if (last_point)
                current_line.add({point: last_point, color: new THREE.Color(0xff0f00), radius: 0.01});
            }
            current_line_type = "travel";
            current_line_subtype = point.subtype;
            current_line.add({point: point.vector, color: new THREE.Color(0xff0f00), radius: 0.01});
            last_point = point.vector;
          }
          else {
            if (current_line_type == "travel")
              finish_line();

            if (current_line.pointsBuffer.length == 0) {
              if (last_point)
                current_line.add({point: last_point, color: new THREE.Color(0xff0f00), radius: 0.1});
            }
            current_line_type = "print";
            current_line_subtype = point.subtype;
            current_line.add({point: point.vector, color: new THREE.Color(0xff0f00), radius: 0.1});
            last_point = point.vector;
          }
        }
        finish_line();
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
