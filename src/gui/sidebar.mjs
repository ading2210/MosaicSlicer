import { active_containers } from "../settings/index.mjs";

const sections = document.getElementById("sections");
const section_template = document.getElementById("section-template");
const setting_template = document.getElementById("setting-template");

var search_index = {};

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
    for (let [setting_id, setting] of Object.entries(category.children)) {
      let setting_element = generate_setting(setting_id, setting);
      template.get_slot("children").append(setting_element);
    }

    title_container.onclick = () => {
      title_container.parentElement.classList.toggle("closed");
    };

    sections.append(template);
  }

  populate_values(sections);
}

function generate_setting(setting_id, setting) {
  let template = setting_template.content.cloneNode(true);
  let value = template.get_slot("value");
  let unit = template.get_slot("unit");
  unit.innerText = setting.unit ?? "";
  value.name = setting_id;

  template.get_slot("setting-name").innerText = setting.label;
  template.get_slot("setting-value").dataset.type = setting.type;
  template.get_slot("setting-container").dataset.setting_id = setting_id;

  if (setting.type === "float") {
    value.type = "number";
    value.step = "0.0001";
  }
  else if (setting.type === "int") {
    value.type = "number";
    value.step = "1";
  }
  else if (setting.type === "enum") {
    let select = document.createElement("select");
    select.name = setting_id;
    for (let [enum_value, pretty_value] of Object.entries(setting.options)) {
      let option = document.createElement("option");
      option.value = enum_value;
      option.innerText = pretty_value;
      select.append(option);
    }
    value.replaceWith(select);
    unit.remove();
  }
  else if (setting.type === "bool")
    value.type = "checkbox";
  else if (setting.type === "str")
    value.type = "text";

  if (setting.children) {
    for (let [child_id, child_setting] of Object.entries(setting.children)) {
      let child = generate_setting(child_id, child_setting);
      child.firstElementChild.classList.add("indented");
      template.firstElementChild.appendChild(child);
    }
  }

  search_index[setting.label] = template.firstElementChild;

  return template;
}

function populate_values(settings_container) {
  let start = performance.now();
  let container_stack = app.settings.active_containers.containers.extruders[0];
  let setting_elements = settings_container.querySelectorAll("span[data-setting_id]");
  container_stack.cache.clear();

  for (let i = 0; i < setting_elements.length; i++) {
    let setting_element = setting_elements[i];
    let setting_id = setting_element.dataset.setting_id;
    let setting_bar = setting_element.children[0];
    let value_element = setting_bar.querySelector(".setting-value");
    let input_element = value_element.children[0];

    try {
      let setting_value = container_stack.resolve_setting(setting_id);

      if (Array.isArray(setting_value))
        setting_value = JSON.stringify(setting_value);
      if (typeof setting_value === "number")
        setting_value = Math.round(setting_value * 10000) / 10000

      if (input_element instanceof HTMLInputElement && input_element.type === "checkbox")
        input_element.checked = !!setting_value;
      else
        input_element.value = setting_value;
    }
    catch (e) {
      if (e.message.includes("stringToUTF8Array"))
        debugger;
      console.warn(`skipping setting ${setting_id}`);
      console.warn(e);
    }
  }
  let end = performance.now();
  console.log("loaded all settings values in ", Math.round((end - start) * 100) / 100, "ms");
}

// Search
function filter_settings(terms) {
  terms = terms.toLowerCase().split(" ");

  let result_names = [];
  for (let setting_name in search_index) {
    let valid = true;
    for (let term of terms) {
      if (!setting_name.toLowerCase().split(" ").includes(term)) {
        valid = false;
        break;
      }
    }
    if (valid)
      result_names.push(setting_name);
  }
  console.log(result_names);
  // todo: render them
  //  - find the sections of each setting
  //  - hide everything except relevent sections
  //  - open the relevent sections and hide everything except the setting names
  //  - make sure this is all undone when the search is cleared/editted
}
const search_input = document.getElementById("setting-search");
search_input.addEventListener("input", () => {
  filter_settings(search_input.value);
});
