import { cura_resources } from "../resources.mjs";
import { import_files, read_file, run_cura } from "./handler.mjs";

//format for settings json:
//https://github.com/Ultimaker/CuraEngine/blob/ba89f84d0e1ebd4c0d7cb7922da33fdaafbb4091/src/communication/CommandLine.cpp#L346-L366
//format for curaengine args:
//https://github.com/Ultimaker/CuraEngine/blob/ba89f84d0e1ebd4c0d7cb7922da33fdaafbb4091/src/Application.cpp#L115

export class CuraEngine {
  constructor() {
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;
    await import_files("/cura", cura_resources);
    this.initialized = true;
  }

  async slice({stl, settings}) {
    if (!stl)
      throw TypeError("stl file not provided");
    await this.init();
    let engine_args = [
      "-p", //log progress info
      "-r",
      "/tmp/settings.json", //settings json path
      "-o",
      "/tmp/out.gcode" //output gcode path
    ];

    let settings_data = new TextEncoder().encode(JSON.stringify(settings));
    let tmp_files = {
      "settings.json": settings_data,
      "model.stl": stl
    };
    await import_files("/tmp", tmp_files);

    let ret = await run_cura(engine_args);
    if (ret !== 0)
      throw new Error("CuraEngine returned bad status code " + ret);
    return await read_file("/tmp/out.gcode");
  }
}
