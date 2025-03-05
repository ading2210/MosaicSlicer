import * as definitions from "../settings/definitions.mjs";

import * as state from "../state.mjs";

const sidebar = document.getElementById("sidebar");
const sidebar_tabs = document.querySelector("#sidebar>.tabs-container");
const tab_settings = document.querySelector("#sidebar>.tab-settings");
const setting_template = document.getElementById("setting-template");
const tab_template = document.getElementById("tab-template");

var selected_tab = null;
var definition = {};

function select_tab(tab) {
  if (selected_tab)
    document.querySelector("#sidebar>.tabs-container>.tab.selected").classList.remove("selected");
  selected_tab = tab;
  document.querySelector(`#sidebar>.tabs-container>.tab[data-setting="${tab}"]`).classList.add("selected");
}

function populate_settings() {
  tab_settings.innerHTML = "";
  let category = definition.printer.settings[selected_tab];

  for (let setting_id in category.children) {
    let setting = category.children[setting_id];
    let template = setting_template.content.cloneNode(true);
    template.get_slot("label").innerText = setting.label;
    template.get_slot("unit").innerText = setting.unit || "";

    let input = template.get_slot("value");
    if (setting.type == "float") {
      input.type = "number";
      input.step = "1";
    }
    else if (setting.type == "int") {
      input.type = "number";
      input.step = "1";
    }
    else if (setting.type == "bool") {
      input.type = "checkbox";
    }

    tab_settings.append(template);
  }
}

export function load_sidebar() {
  definition = definitions.resolve_definitions(state.printer_id);
  let settings = definition.printer.settings;

  console.log(definition.printer.settings);

  // Populate sidebar tabs
  for (let setting in settings) {
    let template = tab_template.content.cloneNode(true);
    let tab = template.get_slot("tab-span");
    let tab_text = template.get_slot("tab-text");
    tab.dataset.setting = setting;
    tab_text.innerText = definition.printer.settings[setting].label;
    tab.onclick = () => {
      console.log("Clicked", setting);
      select_tab(setting);
      populate_settings();
    };
    sidebar_tabs.append(template);
  }

  select_tab(Object.keys(definition.printer.settings)[8]);

  // Populate sidebar settings
  populate_settings();
}
