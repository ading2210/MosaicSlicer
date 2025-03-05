const xml_parser = new DOMParser();
const doc = fetch("pla.xml");

var __material_metadata_setting_map = {
  "GUID": "material_guid",
  "material": "material_type",
  "brand": "material_brand"
};
var __material_properties_setting_map = {"diameter": "material_diameter"};

var __material_settings_setting_map = {
  "print temperature": "default_material_print_temperature",
  "heated bed temperature": "default_material_bed_temperature",
  "standby temperature": "material_standby_temperature",
  "processing temperature graph": "material_flow_temp_graph",
  "print cooling": "cool_fan_speed",
  "retraction amount": "retraction_amount",
  "retraction speed": "retraction_speed",
  "adhesion tendency": "material_adhesion_tendency",
  "surface energy": "material_surface_energy",
  "build volume temperature": "build_volume_temperature",
  "anti ooze retract position": "material_anti_ooze_retracted_position",
  "anti ooze retract speed": "material_anti_ooze_retraction_speed",
  "break preparation position": "material_break_preparation_retracted_position",
  "break preparation speed": "material_break_preparation_speed",
  "break preparation temperature": "material_break_preparation_temperature",
  "break position": "material_break_retracted_position",
  "flush purge speed": "material_flush_purge_speed",
  "flush purge length": "material_flush_purge_length",
  "end of filament purge speed": "material_end_of_filament_purge_speed",
  "end of filament purge length": "material_end_of_filament_purge_length",
  "maximum park duration": "material_maximum_park_duration",
  "no load move factor": "material_no_load_move_factor",
  "break speed": "material_break_speed",
  "break temperature": "material_break_temperature"
};

var __unmapped_settings = ["hardware compatible", "hardware recommended"];

var __keep_serialized_settings = [ // Settings irrelevant to Cura, but that could be present in the files so we must store them and keep them serialized.
  "relative extrusion",
  "flow sensor detection margin",
  "different material purge volume",
  "same material purge volume",
  "end of print purge volume",
  "end of filament purge volume",
  "purge anti ooze retract position",
  "purge drop retract position",
  "purge retract speed",
  "purge unretract speed",
  "purge anti ooze dwell time",
  "purge drop dwell time",
  "dwell time before break preparation move",
  "pressure release dwell time",
  "tainted print core max temperature",
  "recommend cleaning after n prints",
  "maximum heated bed temperature",
  "material bed adhesion temperature",
  "maximum heated chamber temperature",
  "shrinkage percentage",
  "move to die distance"
];

/**
 * Conve
 * @param {string} material
 */
export function deserialize(material) {
  const data = xml_parser.parseFromString(material, "text/xml");

  let meta_data = {};
  meta_data["reserialize_settings"] = {};

  let common_setting_values = {};

  meta_data["name"] = "Unknown Material"; // In case the name tag is missing.

  for (let entry of data.querySelectorAll("metadata>*")) {
    let tag_name = entry.tagName;
    if (tag_name == "name") {
      let brand = entry.getElementsByTagName("brand")[0];
      let material = entry.getElementsByTagName("material")[0];
      let color = entry.getElementsByTagName("color")[0];
      let label = entry.getElementsByTagName("label")[0];

      if (label != null && label.textContent != null)
        meta_data["name"] = label.textContent;
      else {
        if (material.textContent == null)
          meta_data["name"] = "Unknown Material";
        if (color.textContent != "Generic")
          meta_data["name"] = "%s %s" % (color.textContent, material.textContent);
        else
          meta_data["name"] = material.textContent;
      }
      meta_data["brand"] = brand.textContent != null ? brand.textContent : "Unknown Brand";
      meta_data["material"] = material.textContent != null ? material.textContent : "Unknown Type";
      meta_data["color_name"] = color.textContent != null ? color.textContent : "Unknown Color";
      continue;
    }

    if (tag_name == "setting_verion")
      continue;

    meta_data[tag_name] = entry.textContent;

    for (let tag_name in meta_data) {
      if (tag_name in __material_metadata_setting_map)
        common_setting_values[__material_metadata_setting_map[tag_name]] = meta_data[tag_name];
    }
  }

  if (!("description" in meta_data))
    meta_data["description"] = "";

  if (!("adhesion_info" in meta_data))
    meta_data["adhesion_info"] = "";

  let property_values = {};
  let properties = data.querySelectorAll("properties>*");
  for (let entry of properties) {
    let tag_name = entry.tagName;
    property_values[tag_name] = entry.textContent;

    if (tag_name in __material_properties_setting_map)
      common_setting_values[__material_properties_setting_map[tag_name]] = entry.textContent;
  }
  meta_data["approximate_diameter"] = Math.round(
    parseFloat("diameter" in property_values ? property_values["diameter"] : 2.85)
  ).toString(); // In mm
  meta_data["properties"] = property_values;
  meta_data["definition"] = "fdmprinter";

  let common_compatibility = true;
  let settings = data.querySelectorAll("settings>setting");
  for (let entry of settings) {
    let key = entry.getAttribute("key") ?? null;
    if (key in __material_settings_setting_map) {
      if (key == "processing temperature graph") {
        // This setting has no setting text but subtags.
        let graph_nodes = entry.querySelectorAll("point");
        let graph_points = [];
        for (let graph_node in graph_nodes) {
          let flow = parseFloat(graph_node["flow"] ?? null);
          temperature = float(graph_node["temperature"] ?? null);
          graph_points.push([flow, temperature]);
        }
        common_setting_values[__material_settings_setting_map[key]] = graph_points.toString();
      }
      else {
        common_setting_values[__material_settings_setting_map[key]] = entry.textContent;
      }
    }
    else if (key in __unmapped_settings) {
      console.log("unmap");
      if (key == "hardware compatible")
        common_compatibility = _parseCompatibleValue(entry.textContent) in ["yes", "unknown"];
    }
    else if (__keep_serialized_settings.includes(key)) {
      meta_data["reserialize_settings"][key] = entry.textContent;
    }
  }
  meta_data["compatible"] = common_compatibility;

  // This is not in the original implementation
  meta_data["common_setting_values"] = common_setting_values;

  return meta_data;
}
console.log(await doc.then(response => response.text()).then(deserialize));
