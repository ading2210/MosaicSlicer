import { active_containers } from "../settings/index.mjs";

const sections = document.getElementById("sections");
const section_template = document.getElementById("section-template");
const setting_template = document.getElementById("setting-template");

export function load_sidebar() {
  let definition = active_containers.definitions;
  let settings = definition.printer.settings;

  // Populate sidebar sections
  for (let section in settings) {
    let category = settings[section];
    let template = section_template.content.cloneNode(true);
    
    let section_title = template.get_slot("section-title");
    let section_icon = template.get_slot("section-icon");
    let title_container = template.get_slot("title-container");
    section_title.innerText = category.label;
    section_icon.classList.add(`cura-icon-${category.icon}`);

    for (let setting in category.children) {
      let setting_element = generate_setting(category.children[setting]);
      template.get_slot("children").append(setting_element);
    }

    section_title.onclick = () => {
      title_container.parentElement.classList.toggle("closed");
    };
  }
}

function generate_setting(setting_obj) {
  let template = setting_template.content.cloneNode(true);
  let value = template.get_slot("value");
  let unit = template.get_slot("unit");
  unit.innerText = setting_obj.unit ?? "";

  template.get_slot("setting-name").innerText = setting_obj.label;
  template.get_slot("setting-value").dataset.type = setting_obj.type;

  if (setting_obj.type === "float") {
    value.type = "number";
    value.step = "0.01";
  }
  else if (setting_obj.type === "int") {
    value.type = "number";
    value.step = "0.01";
  }
  else if (setting_obj.type === "enum") {
    let select = document.createElement("select");
    for (let [enum_value, pretty_value] of Object.entries(setting_obj.options)) {
      let option = document.createElement("option");
      option.value = enum_value;
      option.innerText = pretty_value;
      select.append(option);
    }
    value.replaceWith(select);
    unit.remove();
  }
  else if (setting_obj.type === "bool")
    value.type = "checkbox";
  else if (setting_obj.type === "str")
    value.type = "text";

  if (setting_obj.children) {
    for (let setting_child in setting_obj.children) {
      let child = generate_setting(setting_obj.children[setting_child]);
      child.firstElementChild.classList.add("enum");
      template.firstElementChild.appendChild(child);
    }
  }

  return template;
}
