export * as buttons from "./buttons.mjs";
export * as file from "./file.mjs";
export * as renderer from "./renderer.mjs";
export * as siderbar from "./sidebar.mjs";
export * as viewer from "./viewer.mjs";
export * as icons from "./icons.mjs";

import { load_sidebar } from "./sidebar.mjs";
import { start_viewer } from "./viewer.mjs";

export function start_gui() {
  start_viewer();
  load_sidebar();
}

DocumentFragment.prototype.get_slot = function(slot_name) {
  return this.querySelector(`[slot='${slot_name}']`);
};
