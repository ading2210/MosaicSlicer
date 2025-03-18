// Three.js setup for STL viewer and GCode viewer
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export const viewport = document.getElementById("viewer");

export var view_width = viewport.clientWidth;
export var view_height = viewport.clientHeight;

// ---- Scene
export const scene = new THREE.Scene();

export const arrow_helper = new THREE.AxesHelper(15);
arrow_helper.position.y = 0.1
arrow_helper.rotation.x = 270 * (Math.PI / 180)
arrow_helper.rotation.z = 180 * (Math.PI / 180)
arrow_helper.rotation.y = 0 *(Math.PI / 180)


scene.add(arrow_helper); // TODO: Use build-plate model

// ---- Camera
export const camera = new THREE.PerspectiveCamera(
  75,
  view_width / view_height
);
camera.position.x = -150;
camera.position.y = 100;
camera.position.z = -150;

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
