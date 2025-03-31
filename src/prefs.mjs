export const default_prefs = {
  printers: {}
};
export let prefs = {};

function load_prefs() {
  let stored_prefs = localStorage.getItem("prefs");
  if (stored_prefs === null)
    prefs = default_prefs;
  else
    prefs = JSON.parse(localStorage.getItem("prefs"));
}

export function save_prefs() {
  localStorage.setItem("prefs", JSON.stringify(prefs));
}

load_prefs();
