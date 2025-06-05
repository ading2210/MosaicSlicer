import { cura_resources } from "../../resources.mjs";
import { resolve_printer } from "../../settings/definitions.mjs";

const add_printer_buttons = document.getElementsByClassName("add-printer-button");

const add_printer_dialog = document.getElementById("add-printer-dialog");
const add_printer_dialog_options = document.getElementById(
  "add-printer-options"
);
const close_add_printer_dialog = document.getElementById(
  "close-add-printer-dialog"
);

function add_printer() {
  add_printer_dialog_options.innerHTML = "";
  let manufacturers = {};
  let manufacturer_elements = {};

  for (let printer of Object.keys(cura_resources)) {
    if (!printer.startsWith("definitions/") || printer == "definitions/")
      continue;

    let printer_id = printer.slice(12, -9);
    let printer_json = resolve_printer(printer_id);
    let manufacturer = printer_json.metadata.manufacturer;

    if (!manufacturers[manufacturer]) {
      // create manufacturer section
      let manufacturer_element = document.createElement("div");
      manufacturer_element.className = "manufacturer-option";

      let bar = document.createElement("span");

      let manufacturer_name = document.createElement("span");
      manufacturer_name.innerText = manufacturer;
      bar.appendChild(manufacturer_name);

      let status_icon = document.createElement("cura-icon");
      status_icon.setAttribute("icon-name", "ionicons_chevron_down_outline");
      bar.appendChild(status_icon);

      bar.addEventListener("click", () => {
        manufacturer_element.classList.toggle("opened");
      });

      manufacturer_element.appendChild(bar);

      let printer_options = document.createElement("div");
      printer_options.className = "printer-options";
      manufacturer_element.appendChild(printer_options);

      add_printer_dialog_options.appendChild(manufacturer_element);

      manufacturer_elements[manufacturer] = manufacturer_element;
      manufacturers[manufacturer] = {};
    }
    manufacturers[manufacturer][printer_json.name] = printer_json;

    let printer_element = document.createElement("span");
    printer_element.className = "printer-option";

    let printer_option_input = document.createElement("input");
    printer_option_input.type = "radio";
    printer_option_input.id = printer_id;
    printer_option_input.name = "printer-option";
    printer_element.appendChild(printer_option_input);

    let print_option_label = document.createElement("label");
    print_option_label.setAttribute("for", printer_id);
    print_option_label.innerText = printer_json["name"];
    printer_element.appendChild(print_option_label);

    manufacturer_elements[manufacturer].lastElementChild.appendChild(
      printer_element
    );
  }

  add_printer_dialog.showModal();

  close_add_printer_dialog.addEventListener("click", () => {
    add_printer_dialog.close();
  });
}

for (let button of add_printer_buttons)
  button.addEventListener("click", add_printer);
