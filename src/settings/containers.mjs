import { eval_py, PythonNameError } from "../python.mjs";
import { merge_deep, resolve_definitions, resolve_settings } from "./definitions.mjs";
import { get_material_type, material_to_profile, parsed_materials } from "./materials.mjs";
import { filter_profiles, resolve_profiles } from "./profiles.mjs";

//classes for "container stacks" that represent the inheritance of profiles
//https://github.com/Ultimaker/Cura/wiki/Container-Stacks

export class ContainerStack {
  constructor(defintion, parent) {
    this.definition = defintion;
    this.parent = parent;
    this.parent_meta = this.parent.definitions.printer.metadata;
    this.type = this.definition.metadata.type;

    this.profile_order = ["user", "custom", "intent", "quality", "material", "nozzle"];
    this.active_profiles = {
      user: null,
      custom: null,
      intent: null,
      quality: null,
      material: null,
      nozzle: null
    };
    this.filters = {
      material: null,
      variant: null,
      quality_type: null
    };

    this.settings = resolve_settings(this.definition.overrides, this.definition.settings);
    this.materials = this.available_materials();
    this.profiles = this.available_profiles();
  }

  resolve_setting(setting_id, profile_num = 0) {
    let setting = this.resolve_setting_definition(setting_id);
    if (setting.resolve)
      return this.resolve_py_expression(setting.resolve);

    //we've run out of profiles to check on this container stack
    if (profile_num === this.profile_order.length) {
      //check the setting definitions first
      let value = setting.value ?? setting.default_value;
      if (typeof value !== "undefined")
        return this.resolve_value(value, setting);
      //otherwise check the global stack
      if (this.type === "machine")
        throw new ReferenceError("setting value not set");
      return this.parent.containers.global.resolve_setting(setting_id);
    }

    let profile_type = this.profile_order[profile_num];
    let profile = this.active_profiles[profile_type];
    if (profile == null || profile.values[setting_id] == null)
      return this.resolve_setting(setting_id, profile_num + 1);
    return this.resolve_value(profile.values[setting_id], setting);
  }
  resolve_setting_definition(setting_id) {
    let setting = this.settings[setting_id];
    if (setting)
      return setting;
    return this.parent.containers.global.settings[setting_id];
  }
  resolve_value(value, setting) {
    if (typeof value === "string") {
      //explicit python expressions
      if (value.startsWith("="))
        return this.resolve_py_expression(value.substring(1));
      //array types
      if (setting.type[0] === "[" && type.at(-1) === "]")
        return this.resolve_py_expression(value);
      //unexpected string in these types
      if (["float", "int", "bool"].includes(setting.type))
        return this.resolve_py_expression(value);
      //unexpected enum value
      if (setting.type === "enum" && !Object.keys(setting.options).includes(value))
        return this.resolve_py_expression(value);
    }
    return value;
  }
  resolve_py_expression(expression) {
    let vars = {};
    console.log("resolving py expression:", expression);
    while (true) {
      try {
        return eval_py(expression, vars);
      }
      catch (py_error) {
        if (!(py_error instanceof PythonNameError))
          throw py_error;
        vars[py_error.var_name] = this.resolve_setting(py_error.var_name);
      }
    }
  }

  set_material(material_id = null) {
    if (this.type === "machine")
      throw TypeError("material profile not allowed on global container");
    let material = this.materials[material_id];
    if (!material_id)
      material = this.preferred_material();
    this.filters.material = material.id.replace("_175", "");
    this.active_profiles.material = material_to_profile(material);
  }
  set_quality(quality_id = null) {
    let quality = this.profiles[quality_id];
    if (!quality_id)
      quality = this.preferred_quality();
    this.filters.quality_type = quality.metadata.quality_type;
    this.active_profiles.quality = quality;
  }
  set_variant(variant_id = null) {
    let variant = this.profiles[variant_id];
    if (!variant_id)
      variant = this.preferred_variant();
    this.filters.variant = variant.general.name;
    this.active_profiles.variant = variant;
  }

  available_materials() {
    let excluded_materials = this.parent_meta.exclude_materials;
    let approx_diameter = Math.round(this.resolve_setting("material_diameter") || 1.75);
    let available_materials = {};
    for (let [material_name, material] of Object.entries(parsed_materials)) {
      let material_base_name = material_name.split("_175")[0];
      if (excluded_materials.includes(material_base_name))
        continue;
      if (material.approximate_diameter != approx_diameter)
        continue;
      available_materials[material_name] = material;
    }
    return available_materials;
  }
  available_qualities() {
    return this.available_profiles("quality");
  }
  available_variants() {
    return this.available_profiles("variant");
  }

  preferred_material() {
    let preferred = this.parent.preferred.material;
    for (let [material_id, material] of Object.entries(this.materials)) {
      if (material_id.startsWith(preferred))
        return material;
    }
    for (let material of Object.values(this.materials)) {
      let type = get_material_type(material);
      if (type === preferred)
        return material;
    }
    return this.materials[0];
  }
  preferred_quality() {
    let preferred_type = this.parent.preferred.quality_type;
    let qualities = Object.values(this.available_qualities());
    for (let quality of qualities) {
      if (quality.metadata.quality_type === preferred_type)
        return quality;
    }
  }
  preferred_variant() {
    let preferred_name = this.parent.preferred.variant;
    let variants = Object.values(this.available_variants());
    for (let variant of variants) {
      if (variant.general.name === preferred_name)
        return variant;
    }
  }

  set_preferred_profiles() {
    if (this.type !== "machine")
      this.set_material();
    this.set_variant();
    this.set_quality();
  }

  available_profiles(profile_type) {
    let profiles = {};
    let definitions = [
      this.parent.definitions.printer,
      ...Object.values(this.parent.definitions.extruders)
    ];
    for (let definition of definitions)
      profiles = merge_deep(profiles, resolve_profiles(definition));
    if (profile_type)
      return filter_profiles(profiles[profile_type], this.filters);
    return profiles;
  }
}

export class ContainerStackGroup {
  constructor(printer_id) {
    this.set_printer(printer_id);
  }

  set_printer(printer_id) {
    this.printer_id = printer_id;
    this.definitions = resolve_definitions(printer_id);

    let printer_metadata = this.definitions.printer.metadata;
    this.preferred = {
      material: printer_metadata.preferred_material,
      quality_type: printer_metadata.preferred_quality_type,
      variant: printer_metadata.preferred_variant_name
    };

    let global_stack = new ContainerStack(this.definitions.printer, this);
    global_stack.set_preferred_profiles();
    this.containers = {
      global: global_stack,
      extruders: {}
    };

    for (let [extuder_id, extruder] of Object.entries(this.definitions.extruders)) {
      let extruder_stack = new ContainerStack(extruder, this);
      extruder_stack.set_preferred_profiles();
      this.containers.extruders[extuder_id] = extruder_stack;
    }
  }
}
