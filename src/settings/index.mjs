export * as definitions from "./definitions.mjs";
export * as materials from "./materials.mjs";
export * as profiles from "./profiles.mjs";
export * as containers from "./containers.mjs";
export * as formatter from "./formatter.mjs";

import { ContainerStackGroup } from "./containers.mjs";

export let active_containers = null;
export let loaded_printers = [];

export function set_active_printer(containers) {
  active_containers = containers;
}

export function load_container(printer_id, prefs=null) {
  let containers = new ContainerStackGroup(printer_id, prefs);
  loaded_printers.push(containers);
  return containers;
}

export function export_prefs() {
  let printers_prefs = [];
  for (let containers of loaded_printers) 
    printers_prefs.push(containers.export_prefs());
  return {
    active: active_containers.printer_id,
    printers: printers_prefs
  }
}