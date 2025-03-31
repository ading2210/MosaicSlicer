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

/** @type {THREE.Group} */
let gcode_mesh;
/** @type {THREE.Group[]} */
let layers = [];

const layer_slider_container = document.getElementById("layer-slider");
const layer_slider = document.getElementById("layer-number");

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
    layers = [];
  }
}

async function show_gcode_viewer() {
  if (!gcode_mesh) {
    if (exported_gcode) {
      console.log("parsing");
      let start = performance.now();

      function get_width(filament_diameter, nozzle_diameter, layer_height, extruded, distance) {
        const rate = filament_diameter / nozzle_diameter;
        const e_per_mm = (extruded / distance) * rate;
        const volume_extruded = extruded * e_per_mm * Math.PI * (nozzle_diameter / 2) ** 2;

        return (volume_extruded / (distance * layer_height)) + layer_height - (Math.PI * layer_height / 4);
      }

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
                current_line.add({point: last_point.vector, color: new THREE.Color(0xff0f00), radius: 0.05});
            }
            current_line_type = "travel";
            current_line_subtype = point.subtype;
            current_line.add({point: point.vector, color: new THREE.Color(0xff0f00), radius: 0.05});
            last_point = point;
          }
          else {
            if (current_line_type == "travel")
              finish_line();

            if (current_line.pointsBuffer.length == 0) {
              if (last_point)
                current_line.add({point: last_point.vector, color: new THREE.Color(0xff0f00), radius: 0.2});
            }
            current_line_type = "print";
            current_line_subtype = point.subtype;

            // let dist;
            // let extruded;
            // if (!last_point) {
            //   dist = new THREE.Vector3(point.vector.x, point.vector.y, point.vector.z).length()
            //   extruded = point.vector.w
            // }
            // else {
            //   dist = new THREE.Vector3(last_point.vector.x, last_point.vector.y, last_point.vector.z).distanceTo(new THREE.Vector3(point.vector.x, point.vector.y, point.vector.z));
            //   extruded = point.vector.w - last_point.vector.w
            // }

            current_line.add({point: point.vector, color: new THREE.Color(0xff0f00), radius: 0.2}); // get_width(1.75, 0.4, 0.2, extruded, dist) / 2
            last_point = point;
          }
        }
        finish_line();
        mesh.add(layer_lines);
        layers.push(layer_lines);
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

      console.log("parsed in " + (performance.now() - start) + " ms");

      layer_slider_container.style.display = "block";
      layer_slider.max = parsed_data.length;
      layer_slider.value = parsed_data.length;
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
  else {
    layer_slider_container.style.display = "none";
  }
});

layer_slider.addEventListener("input", () => {
  if (layers) {
    for (let i in layers) {
      if (i <= parseInt(layer_slider.value))
        layers[i].visible = true;
      else
        layers[i].visible = false;
    }
  }
});
