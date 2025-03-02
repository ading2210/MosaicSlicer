//code for interfacing with the cura engine worker

import { HostRPCFunction, wait_for_worker } from "../rpc.mjs";

let cura_worker = null;

async function create_worker() {
  if (!cura_worker) {
    cura_worker = new Worker(new URL("./worker/index.mjs", import.meta.url), { type: "module" });
    await wait_for_worker(cura_worker)
  }
}

export async function run_cura(new_args) {
  await create_worker();
  let cura_func = new HostRPCFunction("cura_engine", cura_worker);
  for await (let [event, data] of cura_func.call(new_args)) {
    if (event === "done") {
      if (data === 0)
        return;
      else
        throw Error("CuraEngine returned unexpected status code: " + data);
    }
    console.log(event, data);
  }
}

export async function import_files(base_dir, files) {
  await create_worker();
  let cura_func = new HostRPCFunction("import_files", cura_worker);
  await cura_func.call_once(base_dir, files);
}

export async function read_file(file_path) {
  await create_worker();
  let cura_func = new HostRPCFunction("get_file", cura_worker);
  return await cura_func.call_once(file_path);
}