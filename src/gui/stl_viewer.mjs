// Renderer
import { scene } from "./renderer.mjs"

// Loads STL
import * as THREE from "three"
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js"

// ---- Lighting
const spotLight = new THREE.SpotLight(0xffffff);
spotLight.position.set(1, 1, 1);
spotLight.intensity = 10;
scene.add(spotLight);

// ---- Model Material
const material = {
  color: 0x37d79c,
  // A bit of constant light to dampen the shadows
  emissive: 0x37d79c,
  emissiveIntensity: 0.3,
}

const loader = new STLLoader();

export let models = {};
let count = 0;
export function load_stl(stl_data) {
  const mesh = new THREE.Mesh(loader.parse(stl_data), new THREE.MeshPhysicalMaterial(material));
  // name is used for debugging
  mesh.name = count.toString()
  count += 1
  // These settings are specific to the 3DBenchy model
  mesh.scale.set(0.01, 0.01, 0.01)
  mesh.rotateX(-Math.PI / 2)
  scene.add(mesh)

  models[mesh.uuid] = {
    mesh: mesh,
    data: stl_data
  }

  return mesh
}