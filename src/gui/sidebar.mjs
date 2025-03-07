import { active_containers } from "../settings/index.mjs";

const sections = document.getElementById("sections");
const section_template = document.getElementById("section-template");
const setting_template = document.getElementById("setting-template");

export function load_sidebar() {
  let definition = active_containers.definitions;
  let settings = definition.printer.settings;

  // Populate sidebar tabs
  for (let section in settings) {
    let template = section_template.content.cloneNode(true);
    template.get_slot("section-title").innerText = settings[section].label;

    for (let setting in settings[section].children)
      template.get_slot("children").appendChild(generate_setting(settings[section].children[setting]));
    sections.appendChild(template);
  }
  // I'm not sure why, but I can't figure out why I can't add the eventListener in the above loop
  for (let section of sections.querySelectorAll(".section>.section-title")) {
    section.addEventListener("click", () => {
      section.parentElement.classList.toggle("closed");
    });
  }
}

function generate_setting(setting_obj) {
  let template = setting_template.content.cloneNode(true);
  template.get_slot("setting-name").innerText = setting_obj.label;
  template.get_slot("unit").innerText = setting_obj.unit ?? "";
  if (setting_obj.type == "float") {
    template.get_slot("value").type = "number";
    template.get_slot("value").step = "0.01";
  }
  else if (setting_obj.type == "int") {
    template.get_slot("value").type = "number";
    template.get_slot("value").step = "0.01";
  }
  else if (setting_obj.type == "bool")
    template.get_slot("value").type = "checkbox";
  else if (setting_obj.type == "str")
    template.get_slot("value").type = "text";

  if (setting_obj.children) {
    for (let setting_child in setting_obj.children) {
      let child = generate_setting(setting_obj.children[setting_child]);
      child.firstElementChild.classList.add("enum");
      template.firstElementChild.appendChild(child);
    }
  }

  return template;
}
