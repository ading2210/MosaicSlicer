// Three.js setup for STL viewer and GCode viewer
import * as THREE from "three";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { Line2 } from "three/examples/jsm/lines/Line2.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export const viewport = document.getElementById("viewer");

export var view_width = viewport.clientWidth;
export var view_height = viewport.clientHeight;

// ---- Scene
export const scene = new THREE.Scene();

export class ThickAxesHelper extends Line2 {
  constructor(size = 1, linewidth = 6) {
    const vertices = [
      0,
      0,
      0,
      size,
      0,
      0,
      0,
      0,
      0,
      0,
      size,
      0,
      0,
      0,
      0,
      0,
      0,
      size
    ];

    const colors = [
      1,
      0,
      0,
      1,
      0,
      0,
      0,
      1,
      0,
      0,
      1,
      0,
      0,
      0,
      1,
      0,
      0,
      1
    ];

    const geometry = new LineGeometry();
    geometry.setPositions(vertices);
    geometry.setColors(colors);

    const material = new LineMaterial({
      linewidth,
      vertexColors: true
    });
    material.resolution.set(window.innerWidth, window.innerHeight); // resolution of the viewport
    material.worldUnits = false;

    super(geometry, material);
    this.type = "ThickAxesHelper";
    this.computeLineDistances();
  }

  dispose() {
    this.geometry.dispose();
    this.material.dispose();
  }
}

export const arrow_helper = new ThickAxesHelper(15);
arrow_helper.rotation.x = -90 * (Math.PI / 180);
scene.add(arrow_helper);

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
  canvas: document.getElementById("stl-viewer"),
  alpha: true
});
renderer.setClearColor(0xffffff, 0);
renderer.setSize(view_width, view_height);

// ---- Controls
export const controls = new OrbitControls(camera, renderer.domElement);

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
  renderer.render(scene, camera);
}

export function animate() {
  resize();
  requestAnimationFrame(animate);
  controls.update();
  render();
}
