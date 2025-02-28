import { get_json } from "./resources.mjs";

//https://stackoverflow.com/a/34749873/21330993
function is_object(item) {
  return (item && typeof item === 'object' && !Array.isArray(item));
}
export function merge_deep(target, ...sources) {
  if (!sources.length) return target;
  const source = sources.shift();

  if (is_object(target) && is_object(source)) {
    for (const key in source) {
      if (is_object(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        merge_deep(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return merge_deep(target, ...sources);
}

export function resolve_printer(printer_id) {
  let printer = get_json(`definitions/${printer_id}.def.json`);
  if (printer.inherits) 
    return merge_deep(resolve_printer(printer.inherits), printer);
  else 
    return printer;
}

export function resolve_extruder(extruder_id) {
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
  let extruder_ids = Object.values(printer.metadata.machine_extruder_trains);
  let extruders = extruder_ids.map(id => resolve_extruder(id));

  return {
    printer: resolve_printer(printer_id),
    extruders: extruders
  }
}
