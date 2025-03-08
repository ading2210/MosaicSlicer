/**
 * Listeners for actions (eg. slice button, file input, etc)
 */
import { resolve_machine_settings } from "../settings/definitions.mjs";
import { models } from "./viewer.mjs";
import { CuraEngine } from "../engine/index.mjs";

import { load_file } from "./file.mjs";

const slice_button = document.getElementById("slice-button");
const file_input = document.getElementById("stl-file");

// ---- Slice
slice_button.addEventListener("click", async () => {
  let engine = new CuraEngine();
  return;
  /*
  let machine_settings = resolve_machine_settings(state.printer_id);
  function resolve_setting_values(settings) {
    let resolved = {};
    for (let [id, setting] of Object.entries(settings))
      resolved[id] = setting.default_value; //todo: eval the python expressions
    return resolved;
  }
  let resolved_settings = {
    "global": resolve_setting_values(machine_settings.printer),
    "extruder.0": resolve_setting_values(machine_settings.extruders["0"])
  };
  let gcode = await engine.slice({
    stl: models[Object.keys(models)[0]].data, // TODO: Support multiple models
    settings: resolved_settings,
    printer: state.printer_id
  });
  save_file(gcode, "out.gcode", "text/plain");
  */
});

// ---- File imports
file_input.addEventListener("change", (event) => {
  const file = event.target.files[0];

  if (file) {
    if (file.name.split(".").pop() == "stl")
      load_file(file);
  }
});

//listeners for file drop
const drop_zone = document.getElementById("drop-zone");

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
