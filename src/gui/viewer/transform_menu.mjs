import { tab_change_listeners } from "../tabs.mjs";
import { focused, get_half_height, model_controls, models, scene } from "./model_viewer.mjs";

const movement_button = document.getElementById("movement-button");
const rotate_button = document.getElementById("rotate-button");
const scale_button = document.getElementById("scale-button");

const DEGREES_TO_RADIANS = Math.PI / 180;
const RADIANS_TO_DEGREES = 180 / Math.PI;

// ---- Transforms
export function toggle_transform(transform) {
  if (
    !focused ||
    (model_controls.enabled && model_controls.mode == transform)
  ) {
    if (focused)
      model_controls.detach(models[focused].mesh);
    scene.remove(model_controls.getHelper());
    model_controls.enabled = false;

    if (transform == "translate") movement_overlay.style.display = "none";
    else if (transform == "rotate") rotate_overlay.style.display = "none";
    else if (transform == "scale") scale_overlay.style.display = "none";
  }
  else {
    if (model_controls.mode == "translate")
      movement_overlay.style.display = "none";
    else if (model_controls.mode == "rotate")
      rotate_overlay.style.display = "none";
    else if (model_controls.mode == "scale")
      scale_overlay.style.display = "none";

    model_controls.enabled = true;

    model_controls.attach(models[focused].mesh);
    model_controls.setMode(transform);
    scene.add(model_controls.getHelper());

    if (transform == "translate") movement_overlay.style.display = "block";
    else if (transform == "rotate") rotate_overlay.style.display = "block";
    else if (transform == "scale") scale_overlay.style.display = "block";
  }
}

// --- Overlay
const movement_overlay = movement_button.getElementsByClassName("controls-popup")[0];
const rotate_overlay = rotate_button.getElementsByClassName("controls-popup")[0];
const scale_overlay = scale_button.getElementsByClassName("controls-popup")[0];

const movement_x_value = document.getElementById("movement-x-value");
const movement_y_value = document.getElementById("movement-y-value");
const movement_z_value = document.getElementById("movement-z-value");

const rotation_x_value = document.getElementById("rotation-x-value");
const rotation_y_value = document.getElementById("rotation-y-value");
const rotation_z_value = document.getElementById("rotation-z-value");

const scale_x_value = document.getElementById("scale-x-value");
const scale_y_value = document.getElementById("scale-y-value");
const scale_z_value = document.getElementById("scale-z-value");

const overlay_values = [
  movement_x_value,
  movement_y_value,
  movement_z_value,
  rotation_x_value,
  rotation_y_value,
  rotation_z_value,
  scale_x_value,
  scale_y_value,
  scale_z_value
];

// ---- UI Updates
export function update_overlays() {
  if (focused) {
    movement_x_value.value = models[focused].mesh.position.x;
    movement_y_value.value = models[focused].mesh.position.z;
    movement_z_value.value = models[focused].mesh.position.y - get_half_height(models[focused].mesh);

    rotation_x_value.value = Math.round(
      (models[focused].mesh.rotation.x * RADIANS_TO_DEGREES + 90) * 100
    ) / 100;
    rotation_y_value.value = models[focused].mesh.rotation.y * RADIANS_TO_DEGREES;
    rotation_z_value.value = models[focused].mesh.rotation.z * RADIANS_TO_DEGREES;

    scale_x_value.value = models[focused].mesh.scale.x * 100;
    scale_y_value.value = models[focused].mesh.scale.y * 100;
    scale_z_value.value = models[focused].mesh.scale.z * 100;
  }
  else {
    movement_y_value.value = null;
    movement_x_value.value = null;
    movement_z_value.value = null;

    rotation_x_value.value = null;
    rotation_y_value.value = null;
    rotation_z_value.value = null;

    scale_x_value.value = null;
    scale_y_value.value = null;
    scale_z_value.value = null;
  }
}
// --- Overlay
movement_x_value.addEventListener("input", () => {
  models[focused].mesh.position.x = movement_x_value.value;
});
movement_y_value.addEventListener("input", () => {
  models[focused].mesh.position.z = movement_y_value.value;
});
movement_z_value.addEventListener("input", () => {
  console.log(
    get_half_height(models[focused].mesh) + parseInt(movement_z_value.value.to)
  );
  models[focused].mesh.position.y = get_half_height(models[focused].mesh) + parseInt(movement_z_value.value);
});
movement_z_value.addEventListener("change", () => {
  models[focused].mesh.position.y = movement_z_value.value + get_half_height(models[focused].mesh);
  drop_model();
  movement_z_value.value = models[focused].mesh.position.y - get_half_height(models[focused].mesh);
});

rotation_x_value.addEventListener("input", () => {
  models[focused].mesh.rotation.x = (rotation_x_value.value - 90) * DEGREES_TO_RADIANS;
});
rotation_y_value.addEventListener("input", () => {
  models[focused].mesh.rotation.y = rotation_y_value.value * DEGREES_TO_RADIANS;
});
rotation_z_value.addEventListener("input", () => {
  models[focused].mesh.rotation.z = rotation_z_value.value * DEGREES_TO_RADIANS;
});

scale_x_value.addEventListener("input", () => {
  models[focused].mesh.scale.x = scale_x_value.value / 100;
});
scale_y_value.addEventListener("input", () => {
  models[focused].mesh.scale.y = scale_y_value.value / 100;
});
scale_z_value.addEventListener("input", () => {
  models[focused].mesh.scale.z = scale_z_value.value / 100;
});

for (let val of overlay_values) {
  val.addEventListener("change", () => {
    if (!val.value) val.value = 0;
  });
}

const button_listeners = [
  () => {
    toggle_transform("translate");
  },
  () => {
    toggle_transform("rotate");
  },
  () => {
    toggle_transform("scale");
  }
];

tab_change_listeners.push((i) => {
  if (i == 0) {
    // ---- Event Listeners
    movement_button.firstElementChild.addEventListener(
      "click",
      button_listeners[0]
    );
    rotate_button.firstElementChild.addEventListener(
      "click",
      button_listeners[1]
    );
    scale_button.firstElementChild.addEventListener(
      "click",
      button_listeners[2]
    );
  }
  else {
    movement_button.firstElementChild.removeEventListener(
      "click",
      button_listeners[0]
    );
    rotate_button.firstElementChild.removeEventListener(
      "click",
      button_listeners[1]
    );
    scale_button.firstElementChild.removeEventListener(
      "click",
      button_listeners[2]
    );
  }
});
