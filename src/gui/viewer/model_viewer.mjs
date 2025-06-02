// Viewer interactions (eg. clicking on a model, etc.)
import * as THREE from "three";
import { STLExporter } from "three/addons/exporters/STLExporter.js";
import { TransformControls } from "three/examples/jsm/controls/TransformControls.js";

import * as renderer from "./renderer.mjs";
import * as interactions from "./interactions.mjs";

import * as viewer from "./viewer.mjs";
import { clear_slice_state } from "../actions.mjs";
import { tab_change_listeners } from "../tabs.mjs";

import { toggle_transform, update_overlays } from "./transform_menu.mjs";

const controls_bar = document.getElementById("controls");

// Context menu items
const delete_model_context = document.getElementById("context-delete");
const duplicate_model_context = document.getElementById("context-duplicate");

export const scene = new THREE.Scene();

/**
 * @typedef {Object} Model
 * @property {THREE.Mesh} mesh
 * @property {Uint8Array} data
 */

/** @type {Record<string, Model} */
export var models = {};

/** @type {string} */
export var focused = null;

const exporter = new STLExporter();

export const model_controls = new TransformControls(
  renderer.camera,
  renderer.renderer.domElement
);
model_controls.enabled = false;
model_controls.addEventListener("dragging-changed", (event) => {
  renderer.controls.enabled = !event.value;
  clear_slice_state();
  drop_model();
  update_overlays(); // If I put this in event "change" so that it updates as you move, the whole thing becomes very laggy
});

// ---- Model Material
const model_material = new THREE.MeshPhysicalMaterial({
  color: 0x1a5f5a,
  // A bit of constant light to dampen the shadows
  emissive: 0x1a5f5a,
  emissiveIntensity: 0.3
});

// --- Utils
/**
 * Compute half of the height of a mesh
 * @param {THREE.Mesh} mesh
 * @returns {number}
 */
export function get_half_height(mesh) {
  mesh.geometry.computeBoundingBox();
  const size = new THREE.Vector3();
  mesh.geometry.boundingBox.getSize(size);
  return size.z / 2;
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

// Delete models
function delete_model() {
  if (focused) {
    if (model_controls.enabled)
      model_controls.detach(models[focused].mesh);

    scene.remove(models[focused].mesh);
    delete interactions.scene_objects[focused];
    focused = null;
  }
}

/**
 * Load STL or 3MF into viewer as a model
 * @param {ArrayBuffer | string} raw_data
 * @param {'stl' | '3mf'} model_type
 */
export function load_model(raw_data, model_type) {
  let mesh;
  if (model_type == "stl") {
    mesh = new THREE.Mesh(
      viewer.stl_loader.parse(raw_data),
      model_material.clone()
    );
  }
  else if (model_type == "3mf") {
    mesh = new THREE.Mesh(
      viewer.mf_loader.parse(raw_data).children[0].children[0].geometry,
      model_material.clone()
    );
  }
  else { return; }

  mesh.geometry.center();
  mesh.scale.set(1, 1, 1);
  mesh.rotateX(-Math.PI / 2);

  mesh.position.y += get_half_height(mesh);
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
    if (focused != mesh.uuid) focus_stl(mesh.uuid);
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

    mesh.rotation.x = models[model].mesh.rotation.x + Math.PI / 2; // Swap y/z
    mesh.rotation.y = models[model].mesh.rotation.y;
    mesh.rotation.z = models[model].mesh.rotation.z;

    meshes.attach(mesh);
  }

  return exporter.parse(meshes, {binary: true}).buffer;
}

export function start_model_viewer() {
  viewer.setup_scene(scene);
}

const delete_callback = (e) => {
  if (document.activeElement == document.body && e.key == "Backspace") {
    // three.js OrbitControls prevent me from adding the eventlistener to the canvas element
    delete_model();
  }
};

tab_change_listeners.push((i) => {
  if (i == 0) {
    renderer.set_scene(scene, "model");

    // ---- Event Listeners
    window.addEventListener("keydown", delete_callback);
  }
  else {
    window.removeEventListener("keydown", delete_callback);
  }
});

delete_model_context.addEventListener("click", delete_model);
