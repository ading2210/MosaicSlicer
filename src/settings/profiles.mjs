import { ini_files } from "../resources.mjs";

export const profile_types = ["intent", "quality", "variant"];

export function resolve_profiles(definition) {
  let profiles = {};
  let inheritance = definition.inheritance_chain;

  for (let profile_type of profile_types) {
    profiles[profile_type] = {};
    for (let [filename, profile] of Object.entries(ini_files[profile_type])) {
      if (!inheritance.includes(profile.general.definition))
        continue;
      profiles[profile_type][filename] = profile;
    }
  }

  return profiles;
}
