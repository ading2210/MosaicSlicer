// Three.js setup for STL viewer and GCode viewer
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export const viewport = document.getElementById("viewer");
export const canvas = document.getElementById("stl-viewer");

export var view_width = viewport.clientWidth;
export var view_height = viewport.clientHeight;

var current_scene;
export var scene_name = "model";

// ---- Camera
export const camera = new THREE.PerspectiveCamera(
  75,
  view_width / view_height
);
camera.position.x = 150;
camera.position.y = 150;
camera.position.z = 150;

// ---- Renderer
export const renderer = new THREE.WebGLRenderer({
  antialias: true,
  canvas: canvas,
  alpha: true
});
renderer.setClearColor(0xffffff, 0);
renderer.setSize(view_width, view_height);

export function set_scene(scene, name) {
  current_scene = scene;
  scene_name = name;
}

// ---- Controls
export const controls = new OrbitControls(camera, canvas);

// ---- Three.js Updating and Rendering
function resize() {
  if (viewport.clientWidth === view_width && viewport.clientHeight === view_height)
    return;
  if (viewport.clientWidth === 0 && viewport.clientHeight === 0)
    return;
  if (view_width === 0 && view_height === 0)
    return;

  view_width = viewport.clientWidth;
  view_height = viewport.clientHeight;

  camera.aspect = view_width / view_height;
  camera.updateProjectionMatrix();

  renderer.setSize(view_width, view_height);
  render();
}

function render() {
  if (current_scene)
    renderer.render(current_scene, camera);
}

export function animate() {
  resize();
  requestAnimationFrame(animate);
  controls.update();
  render();
}
