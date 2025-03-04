import { ini_files } from "../resources.mjs";

export const profile_types = ["intent", "quality", "variant"];

export function resolve_profiles(definition) {
  let profiles = {};
  let inheritance = [...definition.inheritance_chain].reverse();

  for (let profile_type of profile_types) {
    profiles[profile_type] = {};
    for (let [filename, profile] of Object.entries(ini_files[profile_type])) {
      let priority = inheritance.indexOf(profile.general.definition);
      if (priority === -1)
        continue;
      profile.priority = priority;
      profiles[profile_type][filename] = profile;
    }
  }

  return profiles;
}

function check_filter(profile, filters) {
  for (let [filter_key, filter_value] of Object.entries(filters)) {
    if (profile.metadata[filter_key] !== filter_value)
      return false;
  }
  return true;
}

//filters might be: {material="", variant="", quality_type=""}
export function filter_profiles(profiles, filters = {}) {
  let filtered = [];
  for (let profile of Object.values(profiles)) {
    if (check_filter(profile, filters))
      filtered.push(profile);
  }

  let max_priority = Math.max(...filtered.map(profile => profile.priority));
  filtered = filtered.filter(profile => profile.priority >= max_priority);

  if (filtered.length > 0)
    return filtered;
  return Object.values(profiles);
}
