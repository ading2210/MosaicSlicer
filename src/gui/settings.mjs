export const setting_template = document.getElementById("setting-template");

export function create_group_element(category) {
  let group_div = document.createElement("div");
  group_div.className = "settings-group";
  for (let setting of Object.values(category.children)) {
    let setting_element = create_setting_element(setting);
    group_div.append(setting_element);
  }
  return group_div;
}

export function create_setting_element(setting) {
  let template = setting_template.content.cloneNode(true);
  let value = template.get_slot("value");
  let unit = template.get_slot("unit");
  unit.innerText = setting.unit ?? "";
  value.name = setting.id;

  template.get_slot("setting-name").innerText = setting.label;
  template.get_slot("setting-value").dataset.type = setting.type;
  template.get_slot("setting-container").dataset.setting_id = setting.id;

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
    select.name = setting.id;
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
    for (let child_setting of Object.values(setting.children)) {
      let child = create_setting_element(child_setting);
      child.firstElementChild.classList.add("indented");
      template.firstElementChild.appendChild(child);
    }
  }

  return template;
}

export function populate_values(sections, container_stack) {
  let start = performance.now();
  let setting_elements = sections.querySelectorAll("div[data-setting_id]");
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
        setting_value = Math.round(setting_value * 10000) / 10000;

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
  console.log("populated settings values in ", Math.round((end - start) * 100) / 100, "ms");
}
