/**
 * Controls and mamanger for viewer
 */
import * as renderer from "./renderer.mjs";

import * as THREE from "three";

var raycaster = new THREE.Raycaster();

export var scene_objects = {};
export const SceneObject = {
  mesh: null,
  held: false,
  onclick: null,
  ondrag: null
};

function get_mouse_intersects(mouse_x, mouse_y) {
  var mouse = new THREE.Vector2(
    mouse_x / renderer.view_width * 2 - 1,
    -(mouse_y / renderer.view_height * 2 - 1)
  );
  raycaster.setFromCamera(mouse, renderer.camera);

  let intersects = raycaster.intersectObjects(Array.from(Object.values(scene_objects), (model) => model.mesh), true);
  if (intersects.length > 0)
    return intersects[0].object.uuid;
  return null;
}

var currently_held = null;
renderer.viewport.addEventListener("mousedown", (e) => {
  let intersection = get_mouse_intersects(e.clientX, e.clientY);
  if (intersection) {
    currently_held = intersection;
    renderer.controls.enabled = false;
  }
  else {
    currently_held = null;
  }
});
renderer.viewport.addEventListener("mousemove", (e) => {
  if (currently_held) {
    if (scene_objects[currently_held].ondrag != null)
      scene_objects[currently_held].ondrag(e);
  }
});
renderer.viewport.addEventListener("mouseup", (e) => {
  if (currently_held) {
    if (scene_objects[currently_held].onclick != null)
      scene_objects[currently_held].onclick(e);
  }
  renderer.controls.enabled = true;

  currently_held = null;
});
