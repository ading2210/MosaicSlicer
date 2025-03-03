import { SimpleRPCFunction } from "../../rpc.mjs";
import * as cura from "./cura.mjs";
import * as vfs from "./vfs.mjs";

//all the code in this directory runs inside a seperate worker

const rpc_functions = {
  "cura_engine": cura.RunCuraEngine,
  "import_files": SimpleRPCFunction.create("import_files", vfs.import_files),
  "get_file": SimpleRPCFunction.create("get_file", vfs.get_file)
};

globalThis.addEventListener("message", (event) => {
  let msg = event.data;
  if (msg.event === "call") {
    let func_name = msg.func_name;
    let func_class = rpc_functions[func_name];
    let func = new func_class();
    func.call(...msg.data);
  }
});

//notify the host that the worker has finished loading
globalThis.postMessage(true);
