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

export const icons = {
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
  DocumentFilled
};

function generate_css() {
  let css_rules = `
    .cura-icon {
      background-repeat: no-repeat;
      background-size: auto 100%;
    }
  `;
  for (let [icon_name, svg_url] of Object.entries(icons)) {
    css_rules += `
      .cura-icon-${icon_name} {
        background-image: url("${svg_url}");
      }
    `;
  }
  let style = document.createElement("style");
  style.innerHTML = css_rules;
  document.head.append(style);
}

generate_css();
