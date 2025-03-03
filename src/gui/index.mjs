import { CuraEngine } from "../engine/index.mjs";
import * as python from "../python.mjs";

import { resolve_machine_settings } from "../definitions.mjs";
import { load_sidebar } from "./sidebar.mjs";
import { load_stl, models, start_viewer } from "./viewer.mjs";

const file_input = document.getElementById("stl-file");
const slice_button = document.getElementById("slice-button");

export function start_gui() {
  start_viewer();
  load_sidebar();
}

function load_file(file) {
  const reader = new FileReader();

  reader.onload = (e) => {
    const array_buffer = e.target.result;
    load_stl(array_buffer);
  };

  reader.readAsArrayBuffer(file);
}

function save_file(data, filename, type) {
  let blob = new Blob([data], {type: type});
  let a = document.createElement("a");
  a.download = filename;
  a.href = URL.createObjectURL(blob);
  a.style.display = "none";

  document.body.append(a);
  a.click();
  a.remove();
}

file_input.addEventListener("change", (event) => {
  const file = event.target.files[0];

  if (file) {
    if (file.name.split(".").pop() == "stl")
      load_file(file);
  }
});

// ---- File drop
var drop_zone = document.getElementById("drop-zone");
window.addEventListener("dragover", (event) => {
  event.preventDefault();
  console.log("dragover");
  drop_zone.style.display = "flex";
});

drop_zone.addEventListener("dragleave", (event) => {
  event.preventDefault();
  console.log("dragleave");
  drop_zone.style.display = "none";
});

drop_zone.addEventListener("drop", (event) => {
  event.preventDefault();
  console.log("drop");
  drop_zone.style.display = "none";

  const file = event.dataTransfer.files[0];

  if (file) {
    if (file.name.split(".").pop() == "stl")
      load_file(file);
  }
});

slice_button.addEventListener("click", async () => {
  let engine = new CuraEngine();

  // perhaps we can store settings like this in globalThis and save to localstorage when updated (this is also used in sidebar.mjs)
  let printer_id = "creality_ender3"; //hardcoded for testing
  let machine_settings = resolve_machine_settings(printer_id);
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
    printer: printer_id
  });
  save_file(gcode, "out.gcode", "text/plain");
});
