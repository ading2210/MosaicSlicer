import * as definitions from "./settings/definitions.mjs";
import * as profiles from "./settings/profiles.mjs";
import * as materials from "./settings/materials.mjs";

import * as engine from "./engine/index.mjs";
import * as gui from "./gui/index.mjs";
import * as viewer from "./gui/viewer.mjs";
import * as python from "./python.mjs";

import * as resources from "./resources.mjs";
import * as rpc from "./rpc.mjs";

function define_globals() {
  globalThis.app = {rpc, engine, gui, viewer, resources, definitions, python, profiles, materials};
}

async function main() {
  define_globals();

  await resources.download_resources();
  console.log("Loaded resources");
  resources.load_all_ini();
  materials.load_all_materials();
  console.log("Loaded configurations");
  gui.start_gui();

  console.log("Done loading.");
}

main();
