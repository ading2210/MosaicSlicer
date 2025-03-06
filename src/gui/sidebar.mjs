import * as definitions from "../settings/definitions.mjs";
import { active_containers } from "../settings/index.mjs";

const sidebar = document.getElementById("sidebar");
const sidebar_tabs = document.querySelector("#sidebar>.tabs-container");
const tab_settings = document.querySelector("#sidebar>.tab-settings");
const setting_template = document.getElementById("setting-template");
const tab_template = document.getElementById("tab-template");

var selected_tab = null;
var definition = {};

export function load_sidebar() {
  definition = active_containers.definitions;
  let settings = definition.printer.settings;

  // Populate sidebar tabs
  for (let setting in settings) {
  }
}

// This should be when the settings are populated
// I'm sorry for using forEach, but its termporary
document.querySelectorAll(".section-title").forEach((el) => {
  el.addEventListener("click", () => {
    el.parentElement.classList.toggle("closed");
  });
});
