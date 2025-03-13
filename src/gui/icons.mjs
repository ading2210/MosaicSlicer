/**
 * Populates icons from Cura
 */

//setting icons
import Printer from "cura_icons/default/Printer.svg";
import PrintQuality from "cura_icons/default/PrintQuality.svg";
import PrintShell from "cura_icons/default/PrintShell.svg";
import PrintTopBottom from "cura_icons/default/PrintTopBottom.svg";
import Infill1 from "cura_icons/default/Infill1.svg";
import Spool from "cura_icons/default/Spool.svg";
import SpeedOMeter from "cura_icons/default/SpeedOMeter.svg";
import PrintTravel from "cura_icons/default/PrintTravel.svg";
import Fan from "cura_icons/default/Fan.svg";
import Support from "cura_icons/default/Support.svg";
import Adhesion from "cura_icons/default/Adhesion.svg";
import DualExtrusion from "cura_icons/default/DualExtrusion.svg";
import Bandage from "cura_icons/default/Bandage.svg";
import BlackMagic from "cura_icons/default/BlackMagic.svg";
import Experiment from "cura_icons/default/Experiment.svg";
import DocumentFilled from "cura_icons/default/DocumentFilled.svg";

//icons for slice button gui
import Clock from "cura_icons/default/Clock.svg";

const icons_raw = {
  Printer,
  PrintQuality,
  PrintShell,
  PrintTopBottom,
  Infill1,
  Spool,
  SpeedOMeter,
  PrintTravel,
  Fan,
  Support,
  Adhesion,
  DualExtrusion,
  Bandage,
  BlackMagic,
  Experiment,
  DocumentFilled,

  Clock
};
export const icons = {};
const parser = new DOMParser();

class CuraIconElement extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    let icon_name = this.getAttribute("icon-name");
    if (icon_name)
      this.attributeChangedCallback("icon-name", null, icon_name);
  }

  attributeChangedCallback(name, old_value, new_value) {
    if (name !== "icon-name")
      return;
    let icon_svg = icons[new_value];
    if (!icon_svg)
      return;

    this.replaceChildren();
    this.append(icon_svg);
  }
}

function init() {
  for (let [icon_name, icon_data_url] of Object.entries(icons_raw)) {
    let icon_b64 = icon_data_url.replace("data:image/svg+xml;base64,", "");
    let icon_str = atob(icon_b64);

    let svg_doc = parser.parseFromString(icon_str, "image/svg+xml");
    let svg = svg_doc.getElementsByTagName("svg")[0];
    svg.setAttribute("fill", "currentColor");
    icons[icon_name] = svg;
  }
  window.customElements.define("cura-icon", CuraIconElement);
}

init();
