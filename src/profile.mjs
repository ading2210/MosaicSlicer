// note: i think this current code is obsolete
/*

// Load keys and defaults for profiles
import { get_resource } from "./resources.mjs"

// Flattens inheritence to a single object
export function create_profile(name) {
	console.log("Creating", name)
	let settings = JSON.parse(get_resource("definitions/" + name + ".def.json", true))

	let profile = settings

	if (settings.inherits) {
		console.log(name, "inherits", settings.inherits)
		let parent = create_profile(settings.inherits)

		// TODO: Apply overrides from `parent.overrides` to `profile`
		// Notes:
		// - The overrides don't have any data about where to find the settings within the nesting of `profile`, just the name
		// - The overrided settings only contains the keys to be modified, so you must apply the override rather overwrite it (I'm pretty sure Object.assign will merge them)
	}
	return profile
}

*/