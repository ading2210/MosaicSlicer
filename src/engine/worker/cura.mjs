import CuraEngine from "../../../dist/compiled/CuraEngine.mjs";
import { WorkerRPCFunction } from "../../rpc.mjs";

export const engine = await CuraEngine();

export class RunCuraEngine extends WorkerRPCFunction {
  constructor() {
    super("cura_engine");
  }

  run(new_args) {
    globalThis.__progress_cb = this.progress_cb;
    globalThis.__slice_info_cb = this.slice_info_cb;
    globalThis.__gcode_header_cb = this.gcode_header_cb;
    globalThis.__engine_info_cb = this.engine_info_cb; 

    let args = [
      "slice", 
      "--progress_cb=__progress_cb", 
      "--slice_info_cb=__slice_info_cb", 
      "--gcode_header_cb=__gcode_header_cb", 
      "--engine_info_cb=__engine_info_cb",
      ...new_args
    ];
    return engine.callMain(args);
  }

  progress_cb(progress) {
    this.send("progress", progress);
  }
  slice_info_cb(info) {
    this.send("slice_info", info);
  }
  gcode_header_cb(gcode_b64) {
    this.send("gcode_header", atob(gcode_b64));
  }
  engine_info_cb(engine_info) {
    this.send("engine_info", engine_info)
  }
}
