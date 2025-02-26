import { HostRPCFunction } from "../rpc.mjs";

let cura_worker = null;
const worker_url = "/dist/cura_worker.mjs";

export async function run_cura(...args) {
  if (!cura_worker) {
    cura_worker = new Worker(worker_url, {type: "module"});
    await new Promise(resolve => {
      let callback = (event) => {
        if (event.data !== true) return;
        resolve();
        cura_worker.removeEventListener("message", callback);
      }
      cura_worker.addEventListener("message", callback);
    });
  }
  let cura_func = new HostRPCFunction("cura_engine", cura_worker);
  for await (let [event, data] of cura_func.call(...args)) {
    console.log(event, data);
  }
}