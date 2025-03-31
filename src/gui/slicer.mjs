import { CuraEngine } from "../engine/index.mjs";
import { rpc_callbacks } from "../engine/handler.mjs";

import * as utils from "../utils.mjs";
import { active_containers } from "../settings/index.mjs";
import { format_gcode } from "../settings/formatter.mjs";

export const cura_engine = new CuraEngine();
export let exported_gcode = null;

export function cancel_slice() {
  exported_gcode = null;
  if (cura_engine.active)
    cura_engine.cancel();
}

/**
 * Start slicing `stl`
 * @param {ArrayBuffer} stl
 */
export async function slice(stl, on_progress) {
  // ----- Start Slice
  exported_gcode = null;

  let settings = active_containers.export_settings();
  settings["/tmp/input/model.stl"] = {
    extruder_nr: "0"
  };
  settings["global"]["machine_start_gcode"] = format_gcode(settings["global"]["machine_start_gcode"]);
  settings["global"]["machine_end_gcode"] = format_gcode(settings["global"]["machine_end_gcode"]);

  console.log("Starting slice with settings:", settings);
  // ---- RPC Callbacks
  let gcode_header = "";
  let slice_info = null;
  rpc_callbacks.gcode_header = (header) => {
    gcode_header = header;
  };
  rpc_callbacks.slice_info = (info) => {
    slice_info = process_slice_info(info);
  };

  rpc_callbacks.progress = on_progress;

  let gcode_bytes = await cura_engine.slice({
    stl: stl,
    settings: settings
  });
  exported_gcode = new TextDecoder().decode(gcode_bytes);
  exported_gcode = gcode_header + "\n\n" + exported_gcode;

  await utils.sleep(250);
  return slice_info;
}

function process_slice_info(info) {
  let slice_info = {};

  //time estimate
  let seconds = 0;
  for (let time of Object.values(info.time_estimates))
    seconds += time;

  let minutes = Math.floor(seconds / 60) % 60;
  let hours = Math.floor(seconds / 3600);
  let minutes_str = minutes === 1 ? "minute" : "minutes";
  let hours_str = hours === 1 ? "hour" : "hours";
  if (hours === 0)
    slice_info.time_estimate = `${minutes} ${minutes_str}`;
  else
    slice_info.time_estimate = `${hours} ${hours_str} ${minutes} ${minutes_str}`;

  //material estimate
  let total_length = 0;
  let total_mass = 0;
  for (let [extruder_id, material_volume] of Object.entries(info.material_estimates)) {
    let extruder_stack = active_containers.containers.extruders[extruder_id];
    let active_material = extruder_stack.active_profiles.material;
    let material_density = parseFloat(active_material.metadata.info.properties.density);

    let material_diameter = extruder_stack.resolve_setting("material_diameter");
    let material_cross_section = Math.PI * Math.pow(material_diameter / 2, 2);
    let volume_cubic_cm = material_volume / 1000;
    total_length += (material_volume / material_cross_section) / 1000;
    total_mass += material_density * volume_cubic_cm;
  }
  slice_info.material_estimate = `${Math.round(total_mass)}g \u2022 ${total_length.toFixed(2)}m`;

  return slice_info;
}
