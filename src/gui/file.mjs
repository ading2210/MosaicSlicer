/**
 * File I/O
 */
import { load_stl } from "./viewer/viewer.mjs";

export let stl_file_name = null;

/**
 * Handle file imports (only STLs for now)
 * @param {File} file File object to import
 */
export function load_file(file) {
  const reader = new FileReader();
  reader.file_name = file.name;

  reader.onload = (e) => {
    const array_buffer = reader.result;
    stl_file_name = reader.file_name;
    load_stl(array_buffer);
  };

  reader.readAsArrayBuffer(file);
}

/**
 * Save raw blob data to file
 * @param {BlobPart} data
 * @param {string} filename
 * @param {string} type eg. "text/plain"
 */
export function save_file(data, filename, type) {
  let blob = new Blob([data], {type: type});
  let a = document.createElement("a");
  a.download = filename;
  a.href = URL.createObjectURL(blob);
  a.style.display = "none";

  document.body.append(a);
  a.click();
  a.remove();
}
