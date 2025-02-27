export * as rpc from "./rpc.mjs";
export * as engine from "./engine/index.mjs";
export * as renderer from "./renderer.mjs";
export * as gui from "./gui.mjs";

import * as renderer from "./renderer.mjs";

export function main() {
  renderer.animate();
}