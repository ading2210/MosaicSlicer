import { get_json } from "./resources.mjs";

//module for resolving printer/extruder definitions, and their associated settings

//https://stackoverflow.com/a/34749873/21330993
function is_object(item) {
  return (item && typeof item === "object" && !Array.isArray(item));
}
export function merge_deep(target, ...sources) {
  if (!sources.length) return target;
  const source = sources.shift();

  if (is_object(target) && is_object(source)) {
    for (const key in source) {
      if (is_object(source[key])) {
        if (!target[key]) Object.assign(target, {[key]: {}});
        merge_deep(target[key], source[key]);
      }
      else {
        Object.assign(target, {[key]: source[key]});
      }
    }
  }

  return merge_deep(target, ...sources);
}

function resolve_printer(printer_id) {
  let printer = get_json(`definitions/${printer_id}.def.json`);
  if (printer.inherits)
    return merge_deep(resolve_printer(printer.inherits), printer);
  else
    return printer;
}

function resolve_extruder(extruder_id) {
  let extruder = get_json(`extruders/${extruder_id}.def.json`);
  if (!extruder)
    extruder = get_json(`definitions/${extruder_id}.def.json`);
  if (extruder.inherits)
    return merge_deep(resolve_extruder(extruder.inherits), extruder);
  else
    return extruder;
}

export function resolve_definitions(printer_id) {
  let printer = resolve_printer(printer_id);

  let extruder_data = printer.metadata.machine_extruder_trains;
  let extruders = {};
  for (let [extuder_num, extruder_id] of Object.entries(extruder_data))
    extruders[extuder_num] = resolve_extruder(extruder_id);

  return {
    printer: resolve_printer(printer_id),
    extruders: extruders
  };
}

export function resolve_settings(overrides, settings, resolved = {}) {
  for (let [id, setting] of Object.entries(settings)) {
    if (setting.type !== "category") {
      if (typeof overrides[id] === "object")
        resolved[id] = merge_deep(setting, overrides[id]);
      else
        resolved[id] = setting;
    }
    if (setting.children)
      resolve_settings(overrides, setting.children, resolved);
  }

  return resolved;
}

export function resolve_machine_settings(printer_id) {
  let {printer, extruders} = resolve_definitions(printer_id);
  let printer_settings = resolve_settings(printer.overrides, printer.settings);
  let extuder_settings = {};
  for (let [id, extuder] of Object.entries(extruders))
    extuder_settings[id] = resolve_settings(extuder.overrides, extuder.settings);

  return {
    printer: printer_settings,
    extruders: extuder_settings
  };
}
