import pako from "pako";
import untar from "js-untar";

export let cura_resources = {};

export async function download_resources() {
  let resources_url = "/dist/resources/cura_data.tar.gz";
  let response = await fetch(resources_url);
  let compressed_tar = await response.arrayBuffer();
  cura_resources = await extract_tar(compressed_tar);
}

export async function extract_tar(archive_data) {
  let decompressed = pako.inflate(archive_data);
  let files = await untar(decompressed.buffer);
  let returned_files = {};
  for (let file of files) {
    if (file.type === "L") continue;
    returned_files[file.name] = new Uint8Array(file.buffer);
  }
  return returned_files;
}

export function get_resource(relative_path, as_str=false) {
  let file_data = cura_resources[relative_path];
  if (!file_data) 
    return null;
  if (as_str)
    return new TextDecoder().decode(file_data);
  else
    return file_data;
}

export function get_json(relative_path) {
  return JSON.parse(get_resource(relative_path, true));
}