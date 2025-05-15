import { loaded_printers, set_active_printer } from "../settings/index.mjs";
import { update_gui } from "./index.mjs";

export const printer_prefs_container = document.getElementById("prefs-printer");
export const prefs_printers_list = document.getElementById("prefs-printers-list");
export const printer_options_container = document.getElementById("prefs-printer-options");
export const printer_options_template = document.getElementById("printer-options-template");

export const printers_list = document.getElementById("printers-list");
export const printer_item_template = document.getElementById("printer-item-template");

export function populate_printers() {
  for (let printer of loaded_printers) {
    let printer_name = printer.definitions.printer.name;
    let printer_template = printer_item_template.content.cloneNode(true);
    printer_template.get_slot("printer-name").innerText = printer_name;
    printer_template.get_slot("printer-button").onclick = () => {
      set_active_printer(printer);
      update_gui();
    };
    printers_list.append(printer_template);
  }
}
