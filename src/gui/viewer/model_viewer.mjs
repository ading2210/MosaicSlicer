// Viewer interactions (eg. clicking on a model, etc.)
import * as THREE from "three";
import { STLExporter } from "three/addons/exporters/STLExporter.js";
import { TransformControls } from "three/examples/jsm/controls/TransformControls.js";

import * as renderer from "./renderer.mjs";
import * as interactions from "./interactions.mjs";

import * as viewer from "./viewer.mjs";
import { clear_slice_state } from "../actions.mjs";
import { tab_change_listeners } from "../tabs.mjs";

const DEGREES_TO_RADIANS = Math.PI / 180;
const RADIANS_TO_DEGREES = 180 / Math.PI;

const controls_bar = document.getElementById("controls");
const movement_button = document.getElementById("movement-button");
const rotate_button = document.getElementById("rotate-button");
const scale_button = document.getElementById("scale-button");

// --- Overlay
const movement_overlay = movement_button.getElementsByClassName("controls-popup")[0];
const rotate_overlay = rotate_button.getElementsByClassName("controls-popup")[0];
const scale_overlay = scale_button.getElementsByClassName("controls-popup")[0];

const movement_x_value = document.getElementById("movement-x-value");
const movement_y_value = document.getElementById("movement-y-value");
const movement_z_value = document.getElementById("movement-z-value");

const rotation_x_value = document.getElementById("rotation-x-value");
const rotation_y_value = document.getElementById("rotation-y-value");
const rotation_z_value = document.getElementById("rotation-z-value");

const scale_x_value = document.getElementById("scale-x-value");
const scale_y_value = document.getElementById("scale-y-value");
const scale_z_value = document.getElementById("scale-z-value");

const scene = new THREE.Scene();

/**
 * @typedef {Object} Model
 * @property {THREE.Mesh} mesh
 * @property {Uint8Array} data
 */

/** @type {Record<string, Model} */
export var models = {};

/** @type {string} */
var focused = null;

const exporter = new STLExporter();

export const model_controls = new TransformControls(renderer.camera, renderer.renderer.domElement);
model_controls.enabled = false;
model_controls.addEventListener("dragging-changed", (event) => {
  renderer.controls.enabled = !event.value;
  clear_slice_state();
  drop_model();
});

model_controls.addEventListener("change", () => {
  update_overlays();
});

// ---- Model Material
const model_material = new THREE.MeshPhysicalMaterial({
  color: 0x1a5f5a,
  // A bit of constant light to dampen the shadows
  emissive: 0x1a5f5a,
  emissiveIntensity: 0.3
});

// UI Updates
function update_overlays() {
  if (focused) {
    movement_y_value.value = models[focused].mesh.position.z;
    movement_x_value.value = models[focused].mesh.position.x;
    movement_z_value.value = models[focused].mesh.position.y;

    rotation_x_value.value = models[focused].mesh.rotation.x * RADIANS_TO_DEGREES;
    rotation_y_value.value = models[focused].mesh.rotation.y * RADIANS_TO_DEGREES;
    rotation_z_value.value = models[focused].mesh.rotation.z * RADIANS_TO_DEGREES;

    scale_x_value.value = models[focused].mesh.scale.x * 100;
    scale_y_value.value = models[focused].mesh.scale.y * 100;
    scale_z_value.value = models[focused].mesh.scale.z * 100;
  }
  else {
    movement_y_value.value = null;
    movement_x_value.value = null;
    movement_z_value.value = null;

    rotation_x_value.value = null;
    rotation_y_value.value = null;
    rotation_z_value.value = null;

    scale_x_value.value = null;
    scale_y_value.value = null;
    scale_z_value.value = null;
  }
}

// ---- Model Focusing
/** @param {string} uuid */
function focus_stl(uuid) {
  unfocus_stl();
  focused = uuid;
  console.log(models);
  models[uuid].mesh.material.color.set(0x37d79c);
  models[uuid].mesh.material.emissive.set(0x37d79c);

  update_overlays();
}

/** @param {string} uuid */
function unfocus_stl() {
  if (focused) {
    model_controls.detach(models[focused].mesh);
    scene.remove(model_controls.getHelper());
    model_controls.enabled = false;

    models[focused].mesh.material.color.set(0x1a5f5a);
    models[focused].mesh.material.emissive.set(0x1a5f5a);
    focused = null;
  }

  update_overlays();
}

// ---- Smart Tools
function drop_model() {
  let mesh = models[focused].mesh;

  const box = new THREE.Box3().setFromObject(mesh, true);
  let size = new THREE.Vector3();
  box.getSize(size);

  mesh.position.y = size.y / 2;
}

// ---- Transforms
function toggle_transform(transform) {
  if (model_controls.enabled && model_controls.mode == transform) {
    model_controls.detach(models[focused].mesh);
    scene.remove(model_controls.getHelper());
    model_controls.enabled = false;

    if (transform == "translate")
      movement_overlay.style.display = "none";
    else if (transform == "rotate")
      rotate_overlay.style.display = "none";
    else if (transform == "scale")
      scale_overlay.style.display = "none";
  }
  else {
    if (model_controls.mode == "translate")
      movement_overlay.style.display = "none";
    else if (model_controls.mode == "rotate")
      rotate_overlay.style.display = "none";
    else if (model_controls.mode == "scale")
      scale_overlay.style.display = "none";

    model_controls.enabled = true;

    model_controls.attach(models[focused].mesh);
    model_controls.setMode(transform);
    scene.add(model_controls.getHelper());

    if (transform == "translate")
      movement_overlay.style.display = "block";
    else if (transform == "rotate")
      rotate_overlay.style.display = "block";
    else if (transform == "scale")
      scale_overlay.style.display = "block";
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
    mesh = new THREE.Mesh(viewer.stl_loader.parse(raw_data), model_material.clone());
  else if (model_type == "3mf")
    mesh = new THREE.Mesh(viewer.mf_loader.parse(raw_data).children[0].children[0].geometry, model_material.clone());
  else
    return;

  mesh.geometry.center();
  mesh.scale.set(1, 1, 1);
  mesh.rotateX(-Math.PI / 2);

  mesh.geometry.computeBoundingBox();
  const size = new THREE.Vector3();
  mesh.geometry.boundingBox.getSize(size);
  mesh.position.y += size.z * 0.5;
  // .y += size.z * 0.5; // z/y are flipped

  scene.add(mesh);

  models[mesh.uuid] = {
    mesh: mesh,
    data: raw_data
  };
  focus_stl(mesh.uuid);

  let sceneobj = Object.create(interactions.SceneObject);
  sceneobj.mesh = mesh;
  sceneobj.onclick = () => {
    console.log("clicked model");
    if (focused != mesh.uuid)
      focus_stl(mesh.uuid);
  };

  sceneobj.ondrag = () => {
    if (!model_controls.enabled)
      toggle_transform(model_controls.mode);
  };

  interactions.scene_objects[mesh.uuid] = sceneobj;

  return mesh;
}

// ---- STL Exporter
/**
 * Combines all models and transforms into a single binary STL
 * @returns {ArrayBuffer}
 */
export function export_stl() {
  let meshes = new THREE.Group();
  for (let model in models) {
    let mesh = models[model].mesh.clone();
    mesh.rotation.x = 0;

    mesh.position.x = models[model].mesh.position.x;
    mesh.position.y = -models[model].mesh.position.z;
    mesh.position.z = models[model].mesh.position.y;

    mesh.rotation.x = models[model].mesh.rotation.x + (Math.PI / 2); // Swap y/z
    mesh.rotation.y = models[model].mesh.rotation.y;
    mesh.rotation.z = models[model].mesh.rotation.z;

    meshes.attach(mesh);
  }

  return exporter.parse(meshes, {binary: true}).buffer;
}

const button_listeners = [
  () => {
    toggle_transform("translate");
  },
  () => {
    toggle_transform("rotate");
  },
  () => {
    toggle_transform("scale");
  },
  (e) => {
    if (document.activeElement == document.body && e.key == "Backspace") { // three.js OrbitControls prevent me from adding the eventlistener to the canvas element
      if (focused) {
        scene.remove(models[focused].mesh);
        delete interactions.scene_objects[focused];
        focused = null;
      }
    }
  }
];

export function start_model_viewer() {
  viewer.setup_scene(scene);
}

tab_change_listeners.push((i) => {
  if (i == 0) {
    renderer.set_scene(scene, "model");

    // ---- Event Listeners
    movement_button.firstElementChild.addEventListener("click", button_listeners[0]);
    rotate_button.firstElementChild.addEventListener("click", button_listeners[1]);
    scale_button.firstElementChild.addEventListener("click", button_listeners[2]);

    window.addEventListener("keydown", button_listeners[3]);
  }
  else {
    movement_button.firstElementChild.removeEventListener("click", button_listeners[0]);
    rotate_button.firstElementChild.removeEventListener("click", button_listeners[1]);
    scale_button.firstElementChild.removeEventListener("click", button_listeners[2]);

    window.removeEventListener("keydown", button_listeners[3]);
  }
});

// --- Overlay
movement_x_value.addEventListener("input", () => {
  models[focused].mesh.position.x = movement_x_value.value;
});
movement_y_value.addEventListener("input", () => {
  models[focused].mesh.position.z = movement_y_value.value;
});
movement_z_value.addEventListener("input", () => {
  models[focused].mesh.position.y = movement_z_value.value;
});
movement_z_value.addEventListener("change", () => {
  models[focused].mesh.position.y = movement_z_value.value;
  drop_model();
});

rotation_x_value.addEventListener("input", () => {
  models[focused].mesh.rotation.x = rotation_x_value.value * DEGREES_TO_RADIANS;
});
rotation_y_value.addEventListener("input", () => {
  models[focused].mesh.rotation.y = rotation_y_value.value * DEGREES_TO_RADIANS;
});
rotation_z_value.addEventListener("input", () => {
  models[focused].mesh.rotation.z = rotation_z_value.value * DEGREES_TO_RADIANS;
});

scale_x_value.addEventListener("input", () => {
  models[focused].mesh.scale.x = scale_x_value.value / 100;
});
scale_y_value.addEventListener("input", () => {
  models[focused].mesh.scale.y = scale_y_value.value / 100;
});
scale_z_value.addEventListener("input", () => {
  models[focused].mesh.scale.z = scale_z_value.value / 100;
});
