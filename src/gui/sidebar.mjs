import Fuse from "fuse.js";

import { active_containers } from "../settings/index.mjs";
import { create_group_element, populate_values } from "./settings.mjs";

const fuse = new Fuse([], {
  keys: ["label"],
  threshold: 0.25
});

const sections = document.getElementById("sections");
const section_template = document.getElementById("section-template");
const search_input = document.getElementById("setting-search");

export function load_sidebar() {
  let definition = active_containers.definitions;
  let settings = definition.printer.settings;

  // Populate sidebar sections
  for (let category_id in settings) {
    let category = settings[category_id];
    let template = section_template.content.cloneNode(true);

    let section_title = template.get_slot("section-title");
    let section_icon = template.get_slot("section-icon");
    let title_container = template.get_slot("title-container");

    template.get_slot("section").dataset.category_id = category_id; 
    section_title.innerText = category.label;
    section_icon.classList.add(`cura-icon-${category.icon}`);
    title_container.onclick = () => {
      title_container.parentElement.classList.toggle("closed");
    };

    let group_div = create_group_element(category);
    template.get_slot("settings-group").replaceWith(group_div);

    sections.append(template);
  }

  let extruder_stack = active_containers.containers.extruders[0];
  let global_stack = active_containers.containers.global;
  populate_values(sections, extruder_stack);
  fuse.setCollection(Object.values(global_stack.settings));
}

function show_all_settings() {
  let setting_elements = sections.querySelectorAll("div[data-setting_id]");
  let section_elements = sections.getElementsByClassName("section");
  for (let i = 0; i < setting_elements.length; i++) {
    let setting_div = setting_elements[i];
    setting_div.classList.remove("setting-hidden");
  }
  for (let i = 0; i < section_elements.length; i++) {
    let section_div = section_elements[i];
    section_div.classList.remove("section-hidden");
    if (section_div.dataset.was_closed === "true")
      section_div.classList.add("closed");
    else
      section_div.classList.remove("closed");
    delete section_div.dataset.was_closed;
  }
}

function filter_settings(query) {
  if (query === "") {
    show_all_settings();
    return;
  }

  let container_stack = active_containers.containers.global
  let results = fuse.search(query);
  let result_categories = new Set();
  let result_ids = [];

  for (let result of results) {
    let setting_id = result.item.id;
    let setting_category = container_stack.setting_categories[setting_id];
    result_categories.add(setting_category);
    result_ids.push(setting_id);
  }

  let setting_elements = sections.querySelectorAll("div[data-setting_id]");
  for (let i = 0; i < setting_elements.length; i++) {
    let setting_div = setting_elements[i];
    setting_div.classList.add("setting-hidden");
  }
  for (let setting_id of result_ids) {
    let setting_div = sections.querySelector(`div[data-setting_id="${setting_id}"]`);
    while (!setting_div.classList.contains("settings-group")) {
      setting_div.classList.remove("setting-hidden");
      setting_div = setting_div.parentElement;
    }
  }

  let section_elements = sections.getElementsByClassName("section");
  for (let i = 0; i < section_elements.length; i++) {
    let section_div = section_elements[i];
    let category_id = section_div.dataset.category_id;
    if (!section_div.dataset.was_closed) {
      section_div.dataset.was_closed = section_div.classList.contains("closed");
    }
    if (result_categories.has(category_id))
      section_div.classList.remove("closed", "section-hidden");
    else
      section_div.classList.add("closed", "section-hidden");
  }
  
  // todo: render them
  //  - find the sections of each setting
  //  - hide everything except relevent sections
  //  - open the relevent sections and hide everything except the setting names
  //  - make sure this is all undone when the search is cleared/editted
}
search_input.addEventListener("input", () => {
  filter_settings(search_input.value);
});
