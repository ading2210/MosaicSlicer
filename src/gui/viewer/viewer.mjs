// Viewer interactions (eg. clicking on a model, etc.)
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { ThreeMFLoader } from "three/examples/jsm/loaders/3MFLoader.js";

import * as renderer from "./renderer.mjs";

import { active_containers } from "../../settings/index.mjs";
export const stl_loader = new STLLoader();
export const mf_loader = new ThreeMFLoader();

// ---- Arrows
export class AxesBoxesGroup extends THREE.Group {
  constructor(length) {
    super();
    this.x_box = this.create_box(length, 1, 1, 0xff0000);
    this.x_box.position.set(length / 2, 0, 0);
    this.y_box = this.create_box(1, length, 1, 0x00ff00);
    this.y_box.position.set(0, 0, -length / 2);
    this.z_box = this.create_box(1, 1, length, 0x0000ff);
    this.z_box.position.set(0, length / 2, 0);
  }

  create_box(width, height, depth, color) {
    const geometry = new THREE.BoxGeometry(width, depth, height);
    const material = new THREE.MeshBasicMaterial({color: color});
    const box = new THREE.Mesh(geometry, material);
    this.add(box);
    return box;
  }
}

// ---- Build Plate Materials
const buildplate_material = new THREE.MeshPhysicalMaterial({
  color: 0xdedede,
  opacity: 0.8,
  transparent: true
});

const buildplate_shell_material = new THREE.MeshPhysicalMaterial({
  color: 0x646464,
  opacity: 0.7,
  transparent: true
});

async function load_buildplate(model_filename, scene) {
  let res = await fetch("resources/meshes/" + model_filename);
  let buildplate_mesh;

  if (model_filename.endsWith(".3mf")) {
    buildplate_mesh = new THREE.Mesh(
      mf_loader.parse(await res.arrayBuffer()).children[0].children[0].geometry,
      buildplate_material
    );
  }
  else if (model_filename.endsWith(".stl"))
    buildplate_mesh = new THREE.Mesh(stl_loader.parse(await res.arrayBuffer()), buildplate_material);
  else
    throw new TypeError("Build plate model is of unsupported type; Valid types are '.stl' or '.3mf'");

  buildplate_mesh.position.set(0, 0, 0);
  scene.add(buildplate_mesh);

  // This is to replicate Cura and how it handles the hole in the model
  buildplate_mesh.geometry.computeBoundingBox();
  const size = new THREE.Vector3();
  buildplate_mesh.geometry.boundingBox.getSize(size);
  const rect = new THREE.BoxGeometry(size.x, size.y * 0.5, size.z);

  let shell_mesh = new THREE.Mesh(rect, buildplate_shell_material);
  shell_mesh.position.set(0, -size.y * 0.5, 0);
  scene.add(shell_mesh);

  const axes_boxes = new AxesBoxesGroup(20);
  axes_boxes.position.set(-size.x / 2, 0.1, size.z / 2);
  scene.add(axes_boxes);
}

export function start_viewer() {
  renderer.animate();
}

export function setup_scene(scene) {
  // ---- Lighting
  const spotLight = new THREE.DirectionalLight(0xffffff, 1.25);
  spotLight.position.set(100, 100, 100);

  const ambientLight = new THREE.AmbientLight(0xffffff);
  ambientLight.position.set(0, 0, 0);
  ambientLight.intensity = 1;

  scene.add(spotLight);
  scene.add(ambientLight);

  let printer_definition = active_containers.definitions.printer;
  load_buildplate(printer_definition.metadata.platform, scene);

  // ---- Build Volume Outline
  let machine_settings = active_containers.containers.global.definition.settings.machine_settings.children;
  let build_volume = new THREE.BoxGeometry(
    machine_settings.machine_width.default_value,
    machine_settings.machine_height.default_value,
    machine_settings.machine_width.default_value
  );
  var geo = new THREE.EdgesGeometry(build_volume); // or WireframeGeometry( geometry )
  var mat = new THREE.LineBasicMaterial({color: 0x1a5f5a, linewidth: 0.5});
  var build_frame = new THREE.LineSegments(geo, mat);
  build_frame.position.y += machine_settings.machine_height.default_value / 2;
  scene.add(build_frame);

  // TODO: doesn't work for non-square
  const gridHelperSmall = new THREE.GridHelper(
    machine_settings.machine_width.default_value,
    machine_settings.machine_width.default_value,
    0x737373,
    0x737373,
    0x737373
  );
  const gridHelperBig = new THREE.GridHelper(
    machine_settings.machine_width.default_value,
    machine_settings.machine_width.default_value / 10,
    0x999999,
    0x999999,
    0x999999
  );

  gridHelperBig.position.y += 0.01; // Get rid of flickering

  scene.add(gridHelperSmall);
  scene.add(gridHelperBig);
}
