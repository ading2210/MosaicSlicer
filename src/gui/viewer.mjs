// Viewer interactions (eg. clicking on a model, etc.)
import * as renderer from "./renderer.mjs";

import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";

var raycaster = new THREE.Raycaster();
const loader = new STLLoader();

export let models = {};
let focused_model = null;

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
  color: 0x37d79c,
  // A bit of constant light to dampen the shadows
  emissive: 0x37d79c,
  emissiveIntensity: 0.3
};

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
  focus_model(mesh.uuid);

  return mesh;
}

function focus_model(uuid) {
  unfocus_model();

  focused_model = uuid;
  models[focused_model].mesh.material.color.setHex(0x37d79c);
  models[focused_model].mesh.material.emissive.setHex(0x37d79c);
}

function unfocus_model() {
  if (focused_model) {
    models[focused_model].mesh.material.color.setHex(0x1a5f5a);
    models[focused_model].mesh.material.emissive.setHex(0x1a5f5a);
    focused_model = null;
  }
}

// This logic is for differentiating between a click and a drag
// https://stackoverflow.com/a/70765730/19379762
let clicked = false;
let click_pos = null;
document.addEventListener("mousedown", e => {
  clicked = true;
  click_pos = {x: e.clientX, y: e.clientY};
});
document.addEventListener("mousemove", e => {
  if (click_pos) {
    if ((Math.abs(e.clientX - click_pos.x) > 5) || (Math.abs(e.clientY - click_pos.y) > 5)) // 5 pixels threshold
      clicked = false;
  }
});

document.addEventListener("mouseup", event => {
  if (clicked) {
    // Normalized mouse coordinates
    var mouse = new THREE.Vector2(
      event.clientX / renderer.view_width * 2 - 1,
      -(event.clientY / renderer.view_height * 2 - 1)
    );

    raycaster.setFromCamera(mouse, renderer.camera);

    let intersects = raycaster.intersectObjects(Array.from(Object.values(models), (model) => model.mesh), true);
    console.log(intersects);
    if (intersects.length > 0) {
      unfocus_model();

      focus_model(intersects[0].object.uuid);
    }
    else {
      unfocus_model();
    }
  }
  clicked = false;
});
