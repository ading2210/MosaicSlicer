/**
 * Listeners for actions (eg. slice button, file input, etc)
 */
import { models } from "./viewer.mjs";
import { CuraEngine } from "../engine/index.mjs";

import { save_file, load_file } from "./file.mjs";
import { active_containers } from "../settings/index.mjs";

const slice_button = document.getElementById("slice-button");
const file_input = document.getElementById("stl-file");

// ---- Slice
slice_button.addEventListener("click", async () => {
  let engine = new CuraEngine();
  let settings = active_containers.export_settings();
  settings["/tmp/model.stl"] = {
    extruder_nr: "0"
  }

  console.log("Starting slice with settings:", settings);
  let gcode = await engine.slice({
    stl: models[Object.keys(models)[0]].data, // TODO: Support multiple models
    settings: settings
  });
  save_file(gcode, "out.gcode", "text/plain");
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
