import * as cura from "./cura.mjs";
import * as vfs from "./vfs.mjs";
import { SimpleRPCFunction } from "../../rpc.mjs";

const rpc_functions = {
  "cura_engine": cura.RunCuraEngine,
  "import_files": SimpleRPCFunction.create("import_files", vfs.import_files)
}

globalThis.addEventListener("message", (event) => {
  let msg = event.data;
  if (msg.event === "call") {
    let func_name = msg.func_name;
    let func_class = rpc_functions[func_name];
    let func = new func_class();
    func.call(...msg.data);
  }
});

globalThis.postMessage(true);