import * as engine from "./engine/index.mjs";
import * as gui from "./gui/index.mjs";
import * as renderer from "./gui/renderer.mjs";

import * as rpc from "./rpc.mjs";
import * as resources from "./resources.mjs";

function define_globals() {
  globalThis.app = {rpc, engine, gui, renderer, resources};
}

async function main() {
  define_globals();
  renderer.animate();
  await app.resources.download_resources();
}

main();