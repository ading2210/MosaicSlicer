// Viewer interactions (eg. clicking on a model, etc.)
import * as renderer from "./renderer.mjs";
import * as controls from "./controls.mjs";
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";

const loader = new STLLoader();

const movement_button = document.getElementById("movement-button");
const rotate_button = document.getElementById("rotate-button");
const scale_button = document.getElementById("scale-button");

const x_axis = new THREE.Vector3(1, 0, 0);
const y_axis = new THREE.Vector3(0, 1, 0);
const z_axis = new THREE.Vector3(0, 0, 1);

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
}

// ---- STL Viewer
// ---- Lighting
const spotLight = new THREE.SpotLight(0xffffff);
spotLight.position.set(1, 1, 1);
spotLight.intensity = 10;
renderer.scene.add(spotLight);

// ---- Model Material
const material = {
  color: 0x1a5f5a,
  // A bit of constant light to dampen the shadows
  emissive: 0x1a5f5a,
  emissiveIntensity: 0.3
};

// ---- Model Focusing
/**
 * @param {string} uuid
 */
function focus_stl(uuid) {
  focused = uuid;
  models[uuid].mesh.material.color.set(0x37d79c);
  models[uuid].mesh.material.emissive.set(0x37d79c);
}

/**
 * @param {string} uuid
 */
function unfocus_stl(uuid) {
  focused = null;
  models[uuid].mesh.material.color.set(0x1a5f5a);
  models[uuid].mesh.material.emissive.set(0x1a5f5a);
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

function toggle_movement() {
  if (helpers.length != 0)
    remove_transform_helpers();
  else {
    let x_arrow = new THREE.ArrowHelper(x_axis, models[focused].mesh.position, 0.75, 0xff0000, 0.1, 0.1);
    let y_arrow = new THREE.ArrowHelper(y_axis, models[focused].mesh.position, 0.75, 0x00ff00, 0.1, 0.1);
    let z_arrow = new THREE.ArrowHelper(z_axis, models[focused].mesh.position, 0.75, 0x0000ff, 0.1, 0.1);
    for (let arrow of [x_arrow, y_arrow, z_arrow]) {
      helpers.push(arrow);
      renderer.scene.add(arrow);

      let sceneobj = Object.create(controls.SceneObject);
      sceneobj.mesh = arrow.cone;
      sceneobj.ondrag = (e) => {
        console.log("dragging arrow");
      };
      controls.scene_objects[arrow.cone.uuid] = sceneobj;
    }
  }
}

export function load_stl(stl_data) {
  const mesh = new THREE.Mesh(loader.parse(stl_data), new THREE.MeshPhysicalMaterial(material));
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
    focus_stl(mesh.uuid);
  };
  sceneobj.onclickout = () => {
    unfocus_stl(mesh.uuid);
  };

  controls.scene_objects[mesh.uuid] = sceneobj;

  return mesh;
}

// ---- Event Listeners
movement_button.addEventListener("click", toggle_movement);
