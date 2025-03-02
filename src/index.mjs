import * as engine from "./engine/index.mjs";
import * as gui from "./gui/index.mjs";
import * as renderer from "./gui/renderer.mjs";
import * as definitions from "./definitions.mjs";

import * as rpc from "./rpc.mjs";
import * as resources from "./resources.mjs";
import * as profile from "./profile.mjs";

function define_globals() {
  globalThis.app = { rpc, engine, gui, renderer, resources, definitions };
}

async function main() {
  define_globals();
  renderer.animate();
  await app.resources.download_resources();

  // This is for testing, will be removed    
  console.log("Loaded", profile.create_profile("creality_base")
  )
}

main();