/**
 * Listeners for actions (eg. slice button, file input, etc)
 */
import { models } from "./viewer/viewer.mjs";
import { CuraEngine } from "../engine/index.mjs";
import { rpc_callbacks } from "../engine/handler.mjs";

import { sleep } from "./index.mjs";
import { load_file, save_file } from "./file.mjs";
import { active_containers } from "../settings/index.mjs";

import { notify } from "./notifications.mjs";
import { stl_file_name } from "./file.mjs";

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

export const cura_engine = new CuraEngine();
let exported_gcode = null;

export function set_active_state(active_div) {
  for (let div of [slice_button_div, slice_progress_div, slice_export_div])
    div.dataset.active = false;
  active_div.dataset.active = true;
}

// ---- Slice
slice_button.addEventListener("click", async () => {
  if (Object.keys(models).length === 0) {
    notify("No STLs to Slice", "Please add one or more STL files to slice");
    return;
  }

  exported_gcode = null;
  slice_progress_bar.style.width = "0%";
  gcode_time_estimate.innerText = "No Time Estimation";
  set_active_state(slice_progress_div);

  let settings = active_containers.export_settings();
  settings["/tmp/input/model.stl"] = {
    extruder_nr: "0"
  };
  settings["extruder.0"]["mesh_position_x"] = models[Object.keys(models)[0]].mesh.position.x * 100;
  settings["extruder.0"]["mesh_position_y"] = models[Object.keys(models)[0]].mesh.position.y * 100;

  console.log("Starting slice with settings:", settings);
  exported_gcode = await cura_engine.slice({
    stl: models[Object.keys(models)[0]].data, // TODO: Support multiple models
    settings: settings
  });

  await sleep(250);
  set_active_state(slice_export_div);
});
cancel_button.addEventListener("click", () => {
  cura_engine.cancel();
  set_active_state(slice_button_div);
});
export_gcode_button.addEventListener("click", () => {
  let stl_name = stl_file_name.replace(".", "_");
  let printer_name = active_containers.printer_id;
  let gcode_name = `${printer_name}_${stl_name}.gcode`;

  save_file(exported_gcode, gcode_name, "text/plain");
});

rpc_callbacks.progress = (progress) => {
  slice_progress_bar.style.width = `${progress * 100}%`;
};
rpc_callbacks.slice_info = (info) => {
  let seconds = 0;
  for (let time of Object.values(info.time_estimates))
    seconds += time;

  let minutes = Math.floor(seconds / 60) % 60;
  let hours = Math.floor(seconds / 3600);
  let minutes_str = minutes === 1 ? "minute" : "minutes";
  let hours_str = hours === 1 ? "hour" : "hours";
  if (hours === 0)
    gcode_time_estimate.innerText = `${minutes} ${minutes_str}`;
  else
    gcode_time_estimate.innerText = `${hours} ${hours_str} ${minutes} ${minutes_str}`;
};

// ---- File imports
file_input.addEventListener("change", (event) => {
  const file = event.target.files[0];

  if (file) {
    if (file.name.split(".").pop() == "stl")
      load_file(file);
  }
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

  if (file) {
    if (file.name.split(".").pop() == "stl")
      load_file(file);
  }
});

set_active_state(slice_button_div);
