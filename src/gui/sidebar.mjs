import * as definitions from "../definitions.mjs";

const sidebar = document.getElementById("sidebar");
const sidebar_sections = document.querySelector("#sidebar>.sections");
const section_settings = document.querySelector("#sidebar>.section-settings");

var selected_section = null;

var definition = {};

function select_section(section) {
  if (selected_section)
    document.querySelector("#sidebar>.sections>.section.selected").classList.remove("selected");
  selected_section = section;
  document.querySelector(`#sidebar>.sections>.section[data-setting="${section}"]`).classList.add("selected");
}

function populate_settings() {
  section_settings.innerHTML = "";
  let section = definition.printer.settings[selected_section];

  for (let setting_id in section.children) {
    //   <span class="setting">
    //     <span class="label">Infill Speed</span>
    //     <span class="value">
    //     <input type="number">
    //     <br>
    //     <span>mm/s</span>
    //     </span>
    //   </span>
    //   </div>
    let setting = section.children[setting_id];

    let setting_div = document.createElement("span");
    setting_div.classList.add("setting");

    let label = document.createElement("span");
    label.classList.add("label");
    label.innerText = setting.label;
    setting_div.append(label);

    let value = document.createElement("span");
    value.classList.add("value");

    let input = document.createElement("input");
    console.log(setting_id, setting.type);
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
    value.append(input);

    let unit = document.createElement("span");
    unit.innerText = setting.unit || "";
    value.append(unit);

    setting_div.append(value);
    section_settings.append(setting_div);
  }
}

export function load_sidebar() {
  definition = definitions.resolve_definitions("creality_ender3");
  let settings = definition.printer.settings;

  console.log(definition.printer.settings);

  // Populate sidebar sections
  for (let setting in settings) {
    // <span class="section">Cooling</span>
    let section = document.createElement("span");
    section.classList.add("section");
    section.dataset.setting = setting;
    let sectionText = document.createElement("span");
    sectionText.classList.add("section-text");
    sectionText.innerText = definition.printer.settings[setting].label;
    section.append(sectionText);
    section.onclick = () => {
      console.log("Clicked", setting);
      select_section(setting);
      populate_settings();
    };
    sidebar_sections.append(section);
  }

  select_section(Object.keys(definition.printer.settings)[8]);

  // Populate sidebar settings
  populate_settings();
}
