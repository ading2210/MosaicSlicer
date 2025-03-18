// Three.js setup for STL viewer and GCode viewer
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export const viewport = document.getElementById("viewer");

export var view_width = viewport.clientWidth;
export var view_height = viewport.clientHeight;

// ---- Scene
export const scene = new THREE.Scene();
scene.add(new THREE.AxesHelper(5)); // TODO: Use build-plate model

// ---- Camera
export const camera = new THREE.PerspectiveCamera(
  75,
  view_width / view_height
);
camera.position.x = 100;
camera.position.y = 100;
camera.position.z = 100;

// ---- Renderer
export const renderer = new THREE.WebGLRenderer({
  antialias: true,
  canvas: document.getElementById("stl-viewer"),
  alpha: true
});
renderer.setClearColor(0xffffff, 0);
renderer.setSize(view_width, view_height);

// ---- Controls
export const controls = new OrbitControls(camera, renderer.domElement);

// ---- Three.js Updating and Rendering
function resize() {
  view_width = viewport.clientWidth;
  view_height = viewport.clientHeight;

  camera.aspect = view_width / view_height;
  camera.updateProjectionMatrix();

  renderer.setSize(view_width, view_height);
  render();
}

function render() {
  renderer.render(scene, camera);
}

export function animate() {
  window.addEventListener("resize", () => {
    resize();
  });
  resize();
  requestAnimationFrame(animate);
  controls.update();
  render();
}
