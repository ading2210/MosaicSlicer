import * as settings from "./settings/index.mjs";
import * as engine from "./engine/index.mjs";
import * as gui from "./gui/index.mjs";

import * as python from "./python.mjs";
import * as resources from "./resources.mjs";
import * as rpc from "./rpc.mjs";

function define_globals() {
  globalThis.app = {settings, engine, gui, python, resources, rpc};
}

async function main() {
  define_globals();

  await resources.download_resources();
  console.log("Loaded resources");
  resources.load_all_ini();
  settings.materials.load_all_materials();
  settings.load_container("creality_ender3");

  console.log("Loaded configurations");
  gui.start_gui();

  console.log("Done loading.");
}

main();
