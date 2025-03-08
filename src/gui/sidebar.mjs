import { active_containers } from "../settings/index.mjs";
import { create_group_element, populate_values } from "./settings.mjs";

const sections = document.getElementById("sections");
const section_template = document.getElementById("section-template");
const search_input = document.getElementById("setting-search");

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
    title_container.onclick = () => {
      title_container.parentElement.classList.toggle("closed");
    };

    let group_div = create_group_element(category);
    template.get_slot("settings-group").replaceWith(group_div);

    sections.append(template);
  }

  let extruder_stack = app.settings.active_containers.containers.extruders[0];
  populate_values(sections, extruder_stack);
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
search_input.addEventListener("input", () => {
  filter_settings(search_input.value);
});
