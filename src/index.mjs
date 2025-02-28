export * as rpc from "./rpc.mjs";
export * as engine from "./engine/index.mjs";
export * as renderer from "./gui/renderer.mjs";
export * as gui from "./gui/gui.mjs";

import * as renderer from "./gui/renderer.mjs";

export function main() {
  renderer.animate();
}