// Viewer interactions (eg. clicking on a model, etc.)
import * as renderer from "./renderer.mjs";
import * as controls from "./controls.mjs";
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";

const loader = new STLLoader();

export var models = {};
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

function focus_stl(uuid) {
  focused = uuid;
  models[uuid].mesh.material.color.set(0x37d79c);
  models[uuid].mesh.material.emissive.set(0x37d79c);
}

function unfocus_stl(uuid) {
  focused = null;
  models[uuid].mesh.material.color.set(0x1a5f5a);
  models[uuid].mesh.material.emissive.set(0x1a5f5a);
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
    console.log("Clicked STL");
    focus_stl(mesh.uuid);
  };
  sceneobj.onclickout = () => {
    console.log("Unclicking STL");
    unfocus_stl(mesh.uuid);
  };
  sceneobj.ondrag = (e) => {
    console.log("Dragging STL");
  };

  controls.scene_objects[mesh.uuid] = sceneobj;

  return mesh;
}
