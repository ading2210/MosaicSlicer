import { import_files, kill_worker, read_file, run_cura } from "./handler.mjs";

//format for settings json:
//https://github.com/Ultimaker/CuraEngine/blob/ba89f84d0e1ebd4c0d7cb7922da33fdaafbb4091/src/communication/CommandLine.cpp#L346-L366
//format for curaengine args:
//https://github.com/Ultimaker/CuraEngine/blob/ba89f84d0e1ebd4c0d7cb7922da33fdaafbb4091/src/Application.cpp#L115

export class CuraEngine {
  async slice({stl, settings}) {
    if (!stl)
      throw TypeError("stl file not provided");

    let engine_args = [
      "-p", //log progress info
      "-r",
      "/tmp/input/settings.json", //settings json path
      "-o",
      "/tmp/out.gcode" //output gcode path
    ];

    let settings_data = new TextEncoder().encode(JSON.stringify(settings));
    let tmp_files = {
      "settings.json": settings_data,
      "model.stl": stl
    };
    await import_files("/tmp/input", tmp_files);

    let ret = await run_cura(engine_args);
    if (ret !== 0)
      throw new Error("CuraEngine returned bad status code " + ret);
    return await read_file("/tmp/out.gcode");
  }

  cancel() {
    kill_worker();
  }
}
