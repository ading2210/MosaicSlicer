import { cura_resources, get_resource } from "../resources.mjs";
import { resolve_definitions } from "../definitions.mjs";
import { import_files, run_cura, read_file } from "./handler.mjs";

//format for settings json:
//https://github.com/Ultimaker/CuraEngine/blob/ba89f84d0e1ebd4c0d7cb7922da33fdaafbb4091/src/communication/CommandLine.cpp#L346-L366
//format for curaengine args:
//https://github.com/Ultimaker/CuraEngine/blob/ba89f84d0e1ebd4c0d7cb7922da33fdaafbb4091/src/Application.cpp#L115

export const sample_settings = {
  "global": {},
  "extruder": {},
  "model.stl": {}
}

export class CuraEngine {
  constructor() {
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;
    await import_files("/cura", cura_resources);
    this.initialized = true;
  }

  async slice({stl, settings, printer}) {
    if (!stl)
      throw TypeError("stl file not provided");
    await this.init();
    let engine_args = [
      "-v", //enable verbose output
      "-p", //log progress info
      "-d", "/cura/definitions", //printer definitions search path,
      "-j", `/cura/definitions/${printer}.def.json`, //specific printer definition 
      //"-r", "/tmp/settings.json", //settings json path
      "-l", "/tmp/model.stl", //stl path
      "-o", "/tmp/out.gcode", //output gcode path
    ]

    let settings_data = new TextEncoder().encode(JSON.stringify(settings));
    let tmp_files = {
      "settings.json": settings_data,
      "model.stl": stl
    }
    await import_files("/tmp", tmp_files);

    await run_cura(engine_args);
    return await read_file("/tmp/out.gcode");
  }
}