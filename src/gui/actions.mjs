/**
 * Listeners for actions (eg. slice button, file input, etc)
 */
import * as slicer from "./slicer.mjs";
import { export_stl, models } from "./viewer/model_viewer.mjs";

import { sections } from "./sidebar.mjs";
import { update_sections, update_values } from "./settings.mjs";
import { load_file, save_file } from "./file.mjs";
import { active_containers } from "../settings/index.mjs";

import { notify } from "./notifications.mjs";
import { stl_file_name } from "./file.mjs";
import { clear_gcode } from "./viewer/gcode_viewer.mjs";

const drop_zone = document.getElementById("drop-zone");

const slice_button = document.getElementById("slice-button");
const cancel_button = document.getElementById("cancel-button");
const export_gcode_button = document.getElementById("export-gcode-button");
const file_input = document.getElementById("stl-file");

export const slice_button_div = document.getElementById("slice-button-container");
export const slice_progress_div = document.getElementById("slice-progress-container");
export const slice_export_div = document.getElementById("slice-export-container");

const slice_progress_bar = document.getElementById("slice-progress-bar");
const gcode_time_estimate = document.getElementById("gcode-time-estimate");
const material_estimate = document.getElementById("material-estimate");

export function set_active_state(active_div) {
  for (let div of [slice_button_div, slice_progress_div, slice_export_div])
    div.dataset.active = false;
  active_div.dataset.active = true;
}

export function clear_slice_state() {
  set_active_state(slice_button_div);
  console.log("clearing gcode");
  clear_gcode();
  slicer.cancel_slice();
}

export function update_all(extruder_stack) {
  update_values(sections, extruder_stack);
  update_sections(sections, extruder_stack);
  clear_slice_state();
}

// ---- Slice
slice_button.addEventListener("click", async () => {
  if (Object.keys(models).length === 0) {
    notify("No STLs to Slice", "Please add one or more STL files to slice");
    return;
  }

  set_active_state(slice_progress_div);
  slice_progress_bar.style.width = "0%";
  gcode_time_estimate.innerText = "No Time Estimation";

  let slice_info = await slicer.slice(export_stl(), (progress) => {
    slice_progress_bar.style.width = `${progress * 100}%`;
  });
  gcode_time_estimate.innerText = slice_info.time_estimate;
  material_estimate.innerText = slice_info.material_estimate;

  set_active_state(slice_export_div);
});

cancel_button.addEventListener("click", () => {
  clear_slice_state();
});

export_gcode_button.addEventListener("click", () => {
  let stl_name = stl_file_name.replace(".", "_");
  let printer_name = active_containers.printer_id;
  let gcode_name = `${printer_name}_${stl_name}.gcode`;

  save_file(slicer.exported_gcode, gcode_name, "text/plain");
});

// ---- File imports
file_input.addEventListener("change", (event) => {
  const file = event.target.files[0];

  if (file)
    load_file(file);
});

//listeners for file drop
window.addEventListener("dragover", (event) => {
  event.preventDefault();
  drop_zone.style.display = "flex";
});

drop_zone.addEventListener("dragleave", (event) => {
  event.preventDefault();
  drop_zone.style.display = "none";
});

drop_zone.addEventListener("drop", (event) => {
  event.preventDefault();
  drop_zone.style.display = "none";

  const file = event.dataTransfer.files[0];
  if (file && ["stl", "3mf"].includes(file.name.split(".").pop()))
    load_file(file);
});

set_active_state(slice_button_div);
