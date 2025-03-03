import * as definitions from "./definitions.mjs";
import * as engine from "./engine/index.mjs";
import * as gui from "./gui/index.mjs";
import * as viewer from "./gui/viewer.mjs";
import * as python from "./python.mjs";

import * as resources from "./resources.mjs";
import * as rpc from "./rpc.mjs";

function define_globals() {
  globalThis.app = {rpc, engine, gui, viewer, resources, definitions, python};
}

async function main() {
  define_globals();
  await app.resources.download_resources();
  gui.start_gui();
  console.log("Done loading.");
}

main();
