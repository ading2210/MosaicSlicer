import { active_containers } from "../settings/index.mjs";
import { create_group_element, update_values } from "./settings.mjs";
import { fuse } from "./search.mjs";

const sections = document.getElementById("sections");
const section_template = document.getElementById("section-template");

export function load_sidebar() {
  let definition = active_containers.definitions;
  let settings = definition.printer.settings;
  let extruder_stack = active_containers.containers.extruders[0];
  let global_stack = active_containers.containers.global;

  // Populate sidebar sections
  for (let category_id in settings) {
    let category = settings[category_id];
    let template = section_template.content.cloneNode(true);

    let section_title = template.get_slot("section-title");
    let section_icon = template.get_slot("section-icon");
    let title_container = template.get_slot("title-container");
    let section_div = template.get_slot("section");

    section_div.dataset.category_id = category_id;
    section_title.innerText = category.label;
    section_icon.classList.add(`cura-icon-${category.icon}`);
    title_container.onclick = () => {
      let closed = title_container.parentElement.dataset.closed === "true";
      title_container.parentElement.dataset.closed = !closed;
    };

    let group_div = create_group_element(category, extruder_stack);
    template.get_slot("settings-group").replaceWith(group_div);

    sections.append(template);
  }

  update_values(sections, extruder_stack);
  fuse.setCollection(Object.values(global_stack.settings));
}
