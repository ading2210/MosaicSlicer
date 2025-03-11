// Viewer interactions (eg. clicking on a model, etc.)
import * as renderer from "./renderer.mjs";
import * as controls from "./controls.mjs";
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";

const loader = new STLLoader();

export let models = {};

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

  let sceneobj = Object.create(controls.SceneObject);
  sceneobj.mesh = mesh;
  sceneobj.onclick = () => {
    console.log("Clicked STL");
  };
  sceneobj.ondrag = (e) => {
    console.log("Dragging STL");
  };

  controls.scene_objects[mesh.uuid] = sceneobj;

  return mesh;
}
