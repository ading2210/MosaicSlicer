// Viewer interactions (eg. clicking on a model, etc.)
import * as THREE from "three";
import { TransformControls } from "three/examples/jsm/controls/TransformControls.js";

import * as renderer from "./renderer.mjs";
import * as interactions from "./interactions.mjs";

import { mf_loader, stl_loader } from "./viewer.mjs";

const movement_button = document.getElementById("movement-button");
const rotate_button = document.getElementById("rotate-button");
const scale_button = document.getElementById("scale-button");

/**
 * @typedef {Object} Model
 * @property {THREE.Mesh} mesh
 * @property {Uint8Array} data
 */

/** @type {Record<string, Model} */
export var models = {};

/** @type {string} */
var focused = null;

export const model_controls = new TransformControls(renderer.camera, renderer.renderer.domElement);
model_controls.addEventListener("dragging-changed", function(event) {
  renderer.controls.enabled = !event.value;
});

export function start_model_viewer() {
}

// ---- Model Material
const model_material = new THREE.MeshPhysicalMaterial({
  color: 0x1a5f5a,
  // A bit of constant light to dampen the shadows
  emissive: 0x1a5f5a,
  emissiveIntensity: 0.3
});

// ---- Model Focusing
/** @param {string} uuid */
function focus_stl(uuid) {
  unfocus_stl();
  focused = uuid;
  models[uuid].mesh.material.color.set(0x37d79c);
  models[uuid].mesh.material.emissive.set(0x37d79c);
}

/** @param {string} uuid */
function unfocus_stl() {
  if (focused) {
    models[focused].mesh.material.color.set(0x1a5f5a);
    models[focused].mesh.material.emissive.set(0x1a5f5a);
    focused = null;
  }
}

// ---- Transforms
function toggle_transform(transform) {
  if (model_controls.enabled && model_controls.mode == transform) {
    model_controls.detach(models[focused].mesh);
    renderer.scene.remove(model_controls.getHelper());
    model_controls.enabled = false;
  }
  else {
    model_controls.enabled = true;

    model_controls.attach(models[focused].mesh);
    model_controls.setMode(transform);
    renderer.scene.add(model_controls.getHelper());
  }
}

/**
 * Load STL or 3MF into viewer as a model
 * @param {ArrayBuffer | string} raw_data
 * @param {'stl' | '3mf'} model_type
 */
export function load_model(raw_data, model_type) {
  let mesh;
  if (model_type == "stl")
    mesh = new THREE.Mesh(stl_loader.parse(raw_data), model_material);
  else if (model_type == "3mf")
    mesh = new THREE.Mesh(mf_loader.parse(raw_data).children[0].children[0].geometry, model_material);
  else
    return;

  mesh.scale.set(1, 1, 1);
  mesh.rotateX(-Math.PI / 2);
  renderer.scene.add(mesh);

  models[mesh.uuid] = {
    mesh: mesh,
    data: raw_data
  };
  focus_stl(mesh.uuid);

  let sceneobj = Object.create(interactions.SceneObject);
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

  interactions.scene_objects[mesh.uuid] = sceneobj;

  return mesh;
}

// ---- Event Listeners
movement_button.addEventListener("click", () => {
  toggle_transform("translate");
});
rotate_button.addEventListener("click", () => {
  toggle_transform("rotate");
});
scale_button.addEventListener("click", () => {
  toggle_transform("scale");
});
