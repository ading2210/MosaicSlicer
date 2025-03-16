// Viewer interactions (eg. clicking on a model, etc.)
import * as renderer from "./renderer.mjs";
import * as controls from "./controls.mjs";
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { ThreeMFLoader } from "three/examples/jsm/loaders/3MFLoader.js";

import { active_containers } from "../../settings/index.mjs";

const stl_loader = new STLLoader();
const mf_loader = new ThreeMFLoader();

const movement_button = document.getElementById("movement-button");
const rotate_button = document.getElementById("rotate-button");
const scale_button = document.getElementById("scale-button");

const x_axis = new THREE.Vector3(1, 0, 0);
const y_axis = new THREE.Vector3(0, 1, 0);
const z_axis = new THREE.Vector3(0, 0, 1);
const axes = [x_axis, y_axis, z_axis];

/** @type {THREE.ArrowHelper[]} */
var helpers = [];

/**
 * @typedef {Object} Model
 * @property {THREE.Mesh} mesh
 * @property {Uint8Array} data
 */

/** @type {Record<string, Model} */
export var models = {};

/** @type {string} */
var focused = null;

export function start_viewer() {
  renderer.animate();

  fetch("resources/meshes/" + active_containers.definitions.printer.metadata.platform).then((res) => {
    if (active_containers.definitions.printer.metadata.platform.endsWith(".3mf"))
      res.arrayBuffer().then(load_3mf);
    else if (active_containers.definitions.printer.metadata.platform.endsWith(".stl")) {
      // todo: fix stl function
    }
  });
}

// ---- STL Viewer
// ---- Lighting
const spotLight = new THREE.SpotLight(0xffffff);
spotLight.position.set(2, 2, 2);
spotLight.intensity = 30;
renderer.scene.add(spotLight);

const ambientLight = new THREE.AmbientLight(0xffffff);
ambientLight.position.set(0, 0, 0);
ambientLight.intensity = 1;
renderer.scene.add(ambientLight);

// ---- Model Material
const model_material = {
  color: 0x1a5f5a,
  // A bit of constant light to dampen the shadows
  emissive: 0x1a5f5a,
  emissiveIntensity: 0.3
};

const printer_material = {
  color: 0xdedede,
  opacity: 0.8,
  transparent: true
};

const printer_shell_material = {
  color: 0x646464,
  opacity: 0.7,
  transparent: true
};

// ---- Model Focusing
/**
 * @param {string} uuid
 */
function focus_stl(uuid) {
  unfocus_stl();
  focused = uuid;
  models[uuid].mesh.material.color.set(0x37d79c);
  models[uuid].mesh.material.emissive.set(0x37d79c);
}

/**
 * @param {string} uuid
 */
function unfocus_stl() {
  if (focused) {
    remove_transform_helpers();
    models[focused].mesh.material.color.set(0x1a5f5a);
    models[focused].mesh.material.emissive.set(0x1a5f5a);
    focused = null;
  }
}
// ---- Transformations
function remove_transform_helpers() {
  if (helpers) {
    for (let helper of helpers) {
      delete controls.scene_objects[helper.cone.uuid];
      helper.removeFromParent();
    }
    helpers = [];
  }
}

const CONE_HEIGHT = 0.1;
const CONE_WIDTH = 0.1;
function toggle_movement() {
  if (helpers.length != 0)
    remove_transform_helpers();
  else {
    let x_arrow = new THREE.ArrowHelper(x_axis, models[focused].mesh.position, 0.75, 0xff0000, CONE_HEIGHT, CONE_WIDTH);
    let y_arrow = new THREE.ArrowHelper(y_axis, models[focused].mesh.position, 0.75, 0x00ff00, CONE_HEIGHT, CONE_WIDTH);
    let z_arrow = new THREE.ArrowHelper(z_axis, models[focused].mesh.position, 0.75, 0x0000ff, CONE_HEIGHT, CONE_WIDTH);

    let initial_pos = models[focused].mesh.position.clone();
    for (let [i, arrow] of [x_arrow, y_arrow, z_arrow].entries()) {
      helpers.push(arrow);
      renderer.scene.add(arrow);

      /** @type {controls.SceneObject} */
      let sceneobj = Object.create(controls.SceneObject);
      sceneobj.mesh = arrow.cone;

      let cumulative = 0;
      sceneobj.ondrag = (e) => {
        // This needs to be improved...
        // We should find direction of vector in screen space and track the mouse along that line
        // Mapping that line between screen space, line space, and then movement space will be a bit trickey but this could help
        // https://discourse.threejs.org/t/how-to-converting-world-coordinates-to-2d-mouse-coordinates-in-threejs/2251

        cumulative += i == 0 ? e.movementX : (i == 1 ? -e.movementY : -e.movementX);

        // I don't like making so many copies but whatever
        // Also Three.js doens't support vector operations with normal math syntax (like + or =) which is why I'm using `.add` and `.copy` functions respectively
        models[focused].mesh.position.copy(initial_pos.clone().add(axes[i].clone().setLength(cumulative * 0.005)));

        x_arrow.position.copy(models[focused].mesh.position);
        y_arrow.position.copy(models[focused].mesh.position);
        z_arrow.position.copy(models[focused].mesh.position);
      };
      sceneobj.onclick = () => { // onclick is also called when drag is released
        cumulative = 0;
        initial_pos = models[focused].mesh.position.clone();
      };

      controls.scene_objects[arrow.cone.uuid] = sceneobj;
    }
  }
}

export function load_stl(stl_data) {
  const mesh = new THREE.Mesh(stl_loader.parse(stl_data), new THREE.MeshPhysicalMaterial(model_material));
  // These settings are specific to the 3DBenchy model
  mesh.scale.set(0.01, 0.01, 0.01);
  mesh.rotateX(-Math.PI / 2);
  renderer.scene.add(mesh);

  models[mesh.uuid] = {
    mesh: mesh,
    data: stl_data
  };
  focus_stl(mesh.uuid);

  let sceneobj = Object.create(controls.SceneObject);
  sceneobj.mesh = mesh;
  sceneobj.onclick = () => {
    console.log("clicked model");
    unfocus_stl(mesh.uuid);
    focus_stl(mesh.uuid);
  };
  sceneobj.onclickout = () => {
    console.log("unclicked model");

    unfocus_stl(mesh.uuid);
  };

  controls.scene_objects[mesh.uuid] = sceneobj;

  return mesh;
}

// I should eventually add support for 3MF's but for now its just for the printer
export function load_3mf(mf_data) {
  // Why does ThreeMFLoader work completly differently from STLLoader
  // const mesh = mf_loader.parse(mf_data).children[0].children[0]
  const mesh = new THREE.Mesh(
    mf_loader.parse(mf_data).children[0].children[0].geometry,
    new THREE.MeshPhysicalMaterial(printer_material)
  );
  mesh.scale.set(0.01, 0.01, 0.01);
  renderer.scene.add(mesh);

  // This is to replicate Cura and how it handles the hole in the model
  mesh.geometry.computeBoundingBox();
  const size = new THREE.Vector3();
  mesh.geometry.boundingBox.getSize(size);

  const rect = new THREE.BoxGeometry(size.x * 0.01, size.y * 0.005, size.z * 0.01);

  let shell_mesh = new THREE.Mesh(rect, new THREE.MeshPhysicalMaterial(printer_shell_material));
  shell_mesh.position.y -= 0.0025;

  renderer.scene.add(shell_mesh);

  return mesh;
}

// ---- Event Listeners
movement_button.addEventListener("click", toggle_movement);
