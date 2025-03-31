export * as definitions from "./definitions.mjs";
export * as materials from "./materials.mjs";
export * as profiles from "./profiles.mjs";
export * as containers from "./containers.mjs";
export * as formatter from "./formatter.mjs";

import { ContainerStackGroup } from "./containers.mjs";
import { prefs } from "../prefs.mjs";

export let active_containers = null;
export let loaded_printers = [];

export function set_active_printer(containers) {
  active_containers = containers;
  prefs.active_printer = containers.uuid;
}

export function load_container(printer_id, prefs = null) {
  let containers = new ContainerStackGroup(printer_id, prefs);
  loaded_printers.push(containers);
  return containers;
}

export function apply_prefs() {
  if (!prefs.active_printer) {
    let default_printer = load_container("creality_ender3");
    set_active_printer(default_printer);
    default_printer.save_prefs();
  }
  else {
    for (let printer_prefs of Object.values(prefs.printers)) {
      let printer = load_container(printer_prefs.printer_id, printer_prefs);
      if (prefs.active_printer === printer_prefs.uuid)
        set_active_printer(printer);
    }
  }
  console.log("Loaded prefs:", prefs);
}

export function export_prefs() {
  let printers_prefs = [];
  for (let containers of loaded_printers)
    printers_prefs.push(containers.export_prefs());
  return {
    active: active_containers.printer_id,
    printers: printers_prefs
  };
}
