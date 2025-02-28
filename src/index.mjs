import * as rpc from "./rpc.mjs";
import * as engine from "./engine/index.mjs";
import * as gui from "./gui/gui.mjs";
import * as renderer from "./gui/renderer.mjs";

function define_globals() {
  globalThis.app = {rpc, engine, gui, renderer};
}

function main() {
  define_globals();
  renderer.animate();
}

main();