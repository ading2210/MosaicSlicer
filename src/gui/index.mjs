export * as buttons from "./actions.mjs";
export * as file from "./file.mjs";
export * as renderer from "./viewer/renderer.mjs";
export * as siderbar from "./sidebar.mjs";
export * as viewer from "./viewer/viewer.mjs";
export * as icons from "./icons.mjs";

import { load_sidebar } from "./sidebar.mjs";
import { start_viewer } from "./viewer/viewer.mjs";

export function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function start_gui() {
  start_viewer();
  load_sidebar();

  //hardcoded sleeps are bad practice usually,
  //but in this case there are some layout shifts with the three.js canvas that need to be hidden
  await sleep(100);
  document.getElementById("loading").style.animation = "blur-out 0.25s";
  await sleep(250);
  document.getElementById("loading").style.display = "none";
}

DocumentFragment.prototype.get_slot = function(slot_name) {
  return this.querySelector(`[slot='${slot_name}']`);
};
