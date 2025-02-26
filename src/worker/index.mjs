import { CuraEngineFunction } from "./cura.mjs"; 

const rpc_functions = {
  "cura_engine": CuraEngineFunction
}

self.addEventListener("message", (event) => {
  let msg = event.data;
  if (msg.event === "call") {
    let func_name = msg.func_name;
    let func_class = rpc_functions[func_name];
    let func = new func_class();
    func.call(...msg.data);
  }
});