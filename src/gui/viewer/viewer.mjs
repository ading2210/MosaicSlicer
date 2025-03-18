// Viewer interactions (eg. clicking on a model, etc.)
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";
import { ThreeMFLoader } from "three/examples/jsm/loaders/3MFLoader.js";

import * as renderer from "./renderer.mjs";
import "./model_viewer.mjs";

import { active_containers } from "../../settings/index.mjs";

export const stl_loader = new STLLoader();
export const mf_loader = new ThreeMFLoader();

// ---- Lighting
const spotLight = new THREE.DirectionalLight(0xffffff, 1.25);
spotLight.position.set(100, 100, 100);

const ambientLight = new THREE.AmbientLight(0xffffff);
ambientLight.position.set(0, 0, 0);
ambientLight.intensity = 1;

// ---- Build Plate Materials
const buildplate_material = new THREE.MeshPhysicalMaterial({
  color: 0xdedede,
  opacity: 0.8,
  transparent: true
});

const buildplate_shell_material = new THREE.MeshPhysicalMaterial({
  color: 0x646464,
  opacity: 0.7,
  transparent: true
});

export function start_viewer() {
  renderer.animate();

  renderer.scene.add(spotLight);
  renderer.scene.add(ambientLight);

  fetch("resources/meshes/" + active_containers.definitions.printer.metadata.platform)
    .then(async (res) => {
      let buildplate_mesh;

      if (active_containers.definitions.printer.metadata.platform.endsWith(".3mf")) {
        buildplate_mesh = new THREE.Mesh(
          mf_loader.parse(await res.arrayBuffer()).children[0].children[0].geometry,
          buildplate_material
        );
      }
      else if (active_containers.definitions.printer.metadata.platform.endsWith(".stl"))
        buildplate_mesh = new THREE.Mesh(stl_loader.parse(await res.arrayBuffer()), buildplate_material);
      else
        throw new TypeError("Build plate model is of unsupported type; Valid types are '.stl' or '.3mf'");

      buildplate_mesh.scale.set(1, 1, 1);
      renderer.scene.add(buildplate_mesh);

      // This is to replicate Cura and how it handles the hole in the model
      buildplate_mesh.geometry.computeBoundingBox();
      const size = new THREE.Vector3();
      buildplate_mesh.geometry.boundingBox.getSize(size);

      const rect = new THREE.BoxGeometry(size.x, size.y * 0.5, size.z);

      let shell_mesh = new THREE.Mesh(rect, buildplate_shell_material);
      shell_mesh.position.y -= 0.25;

      renderer.scene.add(shell_mesh);
    });
}
