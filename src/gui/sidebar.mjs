import { active_containers } from "../settings/index.mjs";
import { create_group_element, update_sections, update_values } from "./settings.mjs";
import { fuse } from "./search.mjs";

const sections = document.getElementById("sections");
const section_template = document.getElementById("section-template");
const profile_selector = document.getElementById("profile-selector");

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
    section_icon.setAttribute("icon-name", category.icon);
    title_container.onclick = () => {
      let closed = title_container.parentElement.dataset.closed === "true";
      title_container.parentElement.dataset.closed = !closed;
    };

    let group_div = create_group_element(extruder_stack, sections, category);
    template.get_slot("settings-group").replaceWith(group_div);

    sections.append(template);
  }

  update_values(sections, extruder_stack);
  update_sections(sections, extruder_stack);
  fuse.setCollection(Object.values(global_stack.settings));


  //populate available quality profiles
  //todo: also consider intent profiles in the selector
  let quality_types = active_containers.allowed_quality_types();
  for (let quality_type of quality_types) {
    let global_quality = global_stack.get_quality(quality_type);
    let extruder_quality = extruder_stack.get_quality(quality_type);
    let layer_height = extruder_quality.values.layer_height || global_quality.values.layer_height;
    let quality_name = extruder_quality.general.name || global_quality.general.name;
    if (!layer_height) 
      layer_height = global_stack.resolve_setting("layer_height");

    let option = document.createElement("option");
    option.value = quality_type;
    option.innerText = `${quality_name} - ${layer_height}mm`;
    profile_selector.append(option);
  }
  let active_quality = extruder_stack.active_profiles.quality.metadata.quality_type;
  profile_selector.value = active_quality;
}
