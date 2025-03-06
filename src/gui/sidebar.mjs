import * as definitions from "../settings/definitions.mjs";
import { active_containers } from "../settings/index.mjs";

const sidebar = document.getElementById("sidebar");
const setting_template = document.getElementById("setting-template");

var selected_tab = null;
var definition = {};

export function load_sidebar() {
  definition = active_containers.definitions;
  let settings = definition.printer.settings;

  // Populate sidebar tabs
  for (let setting in settings) {
  }
}

let setting = {
  name: "Line Width",
  unit: "mm",
  children: [
    {
      name: "Wall Line Width",
      unit: "mm",
      children: [
        {
          name: "Outer Wall Line Width",
          unit: "mm"
        },
        {
          name: "Inner Wall Line Width",
          unit: "mm"
        }
      ]
    }
  ]
};

function generate_setting(setting_obj) {
  let template = setting_template.content.cloneNode(true);
  template.get_slot("setting-name").innerText = setting_obj.name;
  template.get_slot("unit").innerText = setting_obj.unit;
  
  // todo: input type

  if (setting_obj.children) {
    for (let setting_child of setting_obj.children) {
      let child = generate_setting(setting_child, true);
      child.firstElementChild.classList.add("enum");
      template.firstElementChild.appendChild(child);
    }
  }

  return template;
}

// This should be when the settings are populated
// I'm sorry for using forEach, but its temporary
document.querySelectorAll(".section-title").forEach((el) => {
  el.addEventListener("click", () => {
    el.parentElement.classList.toggle("closed");
  });
});

window.onload = () => {
  document.querySelector(".settings").appendChild(generate_setting(setting));
};
