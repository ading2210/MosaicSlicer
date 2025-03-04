import untar from "js-untar";
import pako from "pako";
import * as ini from "ini";

export let cura_resources = {};
export let ini_files = {};

export async function download_resources() {
  let resources_url = "./dist/resources/cura_data.tar.gz";
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

export function get_resource(relative_path, as_str = false) {
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

export function load_all_ini() {
  for (let path in cura_resources) {
    if (!path.endsWith(".cfg"))
      continue;

    let ini_data = ini.parse(get_resource(path, true));
    let path_split = path.split("/");
    let type = ini_data.metadata?.type || path_split[0];
    let filename = path_split.at(-1);
    if (!ini_files[type])
      ini_files[type] = {};
    ini_files[type][filename] = ini_data;
  }
}
