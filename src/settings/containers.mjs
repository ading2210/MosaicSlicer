import { eval_py, py_api, PythonNameError } from "../python.mjs";
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
    this.bound_py_funcs = {
      extruderValues: this.py_extruderValues.bind(this),
      extruderValue: this.py_extruderValue.bind(this),
      //anyExtruderWithMaterial: this.py_anyExtruderWithMaterial.bind(this),
      //anyExtruderNrWithOrDefault: this.py_anyExtruderNrWithOrDefault.bind(this),
      resolveOrValue: this.py_resolveOrValue.bind(this),
      defaultExtruderPosition: this.py_defaultExtruderPosition.bind(this),
      valueFromContainer: this.py_valueFromContainer.bind(this),
      valueFromExtruderContainer: this.py_valueFromExtruderContainer.bind(this)
    };

    this.cache = new Map();
    this.settings = resolve_settings(this.definition.overrides, this.definition.settings);
    this.materials = this.available_materials();
    this.profiles = this.available_profiles();
  }

  //memoization to improve performance
  resolve_setting(setting_id, call_resolve = true) {
    let key = `${setting_id},${call_resolve}`;
    if (this.cache.has(key))
      return this.cache.get(key);
    let ret = this._resolve_setting(setting_id, call_resolve);
    this.cache.set(key, ret);
    if (key === "support_interface_extruder_nr")
      debugger;
    return ret;
  }
  _resolve_setting(setting_id, call_resolve = true, profile_num = 0) {
    let setting = this.resolve_setting_definition(setting_id);
    if (setting.resolve && call_resolve)
      return this.resolve_py_expression(setting.resolve, call_resolve);

    //we've run out of profiles to check on this container stack
    if (profile_num === this.profile_order.length) {
      //check the setting definitions first
      let value = setting.value ?? setting.default_value;
      if (typeof value !== "undefined")
        return this.resolve_value(value, setting);
      //otherwise check the global stack
      if (this.type === "machine")
        throw new ReferenceError("setting value not set");
      return this.parent.containers.global.resolve_setting(setting_id, call_resolve);
    }

    let profile_type = this.profile_order[profile_num];
    let profile = this.active_profiles[profile_type];
    if (profile == null || profile.values[setting_id] == null)
      return this._resolve_setting(setting_id, call_resolve, profile_num + 1);
    return this.resolve_value(profile.values[setting_id], setting, call_resolve);
  }
  resolve_setting_definition(setting_id) {
    let setting = this.settings[setting_id];
    if (typeof setting !== "undefined")
      return setting;
    setting = this.parent.containers.global.settings[setting_id];
    if (typeof setting !== "undefined")
      return setting;
    throw TypeError(`setting ${setting_id} not found`);
  }
  resolve_value(value, setting, call_resolve) {
    if (typeof value === "string") {
      //explicit python expressions
      if (value.startsWith("="))
        return this.resolve_py_expression(value.substring(1), call_resolve);
      //array types
      if (setting.type[0] === "[" && setting.type.at(-1) === "]")
        return this.resolve_py_expression(value, call_resolve);
      //unexpected string in these types
      if (["float", "int", "bool"].includes(setting.type))
        return this.resolve_py_expression(value, call_resolve);
      if (setting.type === "extruder" && isNaN(parseInt(value)))
        return this.resolve_py_expression(value, call_resolve);
      //unexpected enum value
      if (setting.type === "enum" && !Object.keys(setting.options).includes(value))
        return this.resolve_py_expression(value, call_resolve);
    }
    return value;
  }
  resolve_py_expression(expression, call_resolve) {
    this.setup_py_api();
    let vars = {};
    while (true) {
      try {
        return eval_py(expression, vars);
      }
      catch (py_error) {
        if (!(py_error instanceof PythonNameError))
          throw py_error;
        vars[py_error.var_name] = this.resolve_setting(py_error.var_name, call_resolve);
      }
    }
  }

  setup_py_api() {
    Object.assign(py_api, this.bound_py_funcs);
  }
  py_extruderValues(key) {
    let ret = [];
    for (let extruder_stack of Object.values(this.parent.containers.extruders))
      ret.push(extruder_stack.resolve_setting(key, false));
    return ret;
  }
  py_extruderValue(extruder, key) {
    let extruder_stack = this.parent.containers.extruders[extruder];
    return extruder_stack.resolve_setting(key, false);
  }
  py_anyExtruderWithMaterial() {
    throw Error("not implemented: py_anyExtruderWithMaterial");
  }
  py_anyExtruderNrWithOrDefault() {
    throw Error("not implemented: py_anyExtruderNrWithOrDefault");
  }
  py_resolveOrValue(key) {
    throw Error("not implemented: py_resolveOrValue");
  }
  py_defaultExtruderPosition() {
    throw Error("not implemented: py_defaultExtruderPosition");
  }
  py_valueFromContainer(key, index) {
    throw Error("not implemented: py_valueFromContainer");
  }
  py_valueFromExtruderContainer(key, index) {
    throw Error("not implemented: py_valueFromExtruderContainer");
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
