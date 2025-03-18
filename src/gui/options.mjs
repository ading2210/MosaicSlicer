/**
 * Options bar
 */

import { active_containers } from "../settings/index.mjs";

const printer_button = document.getElementById("printer-button");
const printer_name = document.getElementById("printer-name");
const printers_dropdown = document.getElementById("printer-button");
const printers_list = document.getElementById("printers-list");
const printer_item_template = document.getElementById("printer-item-template");

const filament_name = document.getElementById("filament-name");
const nozzle_name = document.getElementById("nozzle-name");

export function load_options() {
  printer_button.dataset.printer_id = active_containers.printer_id;
  printer_name.innerText = active_containers.definitions.printer.name;

  let extruder_stack = app.settings.active_containers.containers.extruders[0];
  let material_info = extruder_stack.active_profiles.material.metadata.info;
  let material_name = `${material_info.brand} ${material_info.name}`;
  filament_name.innerText = material_name;

  let variant_profile = extruder_stack.active_profiles.variant;
  if (variant_profile)
    nozzle_name.innerHTML = variant_profile.general.name;
}
