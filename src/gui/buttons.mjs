import { resolve_machine_settings } from "../settings/definitions.mjs";
import { models } from "./viewer.mjs";
import { CuraEngine } from "../engine/index.mjs";

import * as state from "../state.mjs";

const slice_button = document.getElementById("slice-button");

slice_button.addEventListener("click", async () => {
  let engine = new CuraEngine();

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
});
